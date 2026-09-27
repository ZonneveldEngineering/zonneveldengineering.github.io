/* @pjs globalKeyEvents=false; 
 */

// Simulation of Cycloid Drawing Machine  - latest version is on https://github.com/jbum/CycloidDrawingMachine
//
// Physical machine designed by Joe Freedman  kickstarter.com/projects/1765367532/cycloid-drawing-machine
// Processing simulation by Jim Bumgardner    krazydad.com
//
static final float inchesToPoints = 72; // controls display scaling
static final float mmToInches = 1/25.4;

float seventyTwoScale = inchesToPoints / 72.0; // Don't change this

int[][] setupTeeth = {
    {150,72},
    {120,94,90,34},
    {150,50,100,34,40},
    {144, 100, 72},
    {150, 98, 100},
    {150, 100, 74},
    {150,50,100,34,40,50,50},
  };

float[][] setupMounts = { // mount point measurements
  {0, 3.3838, 10.625},
  {1.5, 4.4798,  10},
  {0.8973, 1.5, 12},
  {4, 4, 0.8, 2, 8.625},
  {0.7, 2, 4, 8, 9},
  {0.7, 3.3838, 4, 0.21, 12.75, 5.5, 5.25},
  {2.5, 1.0, 14.0},
};

float[][] setupPens = {
  {3.375,-55},
  {4.5,90},
  {7.5,-90},
  {4.75,-65},
  {4.5,-90},
  {3.125,-65},
  {6.5,-90},
};

Boolean[][] setupInversions = {
  {true},
  {false},
  {false},
  {false, false},
  {false, false},
  {false, false, false},
  {false},
};

float bWidth = 18.14;
float bHeight = 11.51;
float pCenterX = 8.87;
float pCenterY = 6.61;
float toothRadius = 0.0956414*inchesToPoints;
float meshGap = 1.5*mmToInches*inchesToPoints; // 1.5 mm gap needed for meshing gears
PFont  gFont, hFont, nFont;
PImage titlePic;

int setupMode = 0; // 0 = simple, 1 = moving pivot, 2 = orbiting gear, 3 = orbit gear + moving pivot

ArrayList<Gear> activeGears;
ArrayList<MountPoint> activeMountPoints;
ArrayList<Channel> rails;
ArrayList<ConnectingRod> activeConnectingRods;

Selectable selectedObject = null;
Gear crank, turnTable;
MountPoint slidePoint, anchorPoint, discPoint, penMount;
Channel crankRail, anchorRail, pivotRail;

ConnectingRod cRod;
PenRig penRig, selectPenRig = null;

PGraphics paper;
float paperScale = 1;
float paperWidth = 9*inchesToPoints*paperScale;
float crankSpeed = TWO_PI/720;  // rotation per frame  - 0.2 is nice.
int passesPerFrame = 1;
boolean hiresMode = false;

boolean isStarted = false;
boolean isMoving = false;
boolean penRaised = true;

float lastPX = -1, lastPY = -1;
int myFrameCount = 0;
int myLastFrame = -1;
int drawDirection = 1;
int recordCtr = 0;

color[] penColors = {color(0,0,0), color(192,0,0), color(0,128,0), color(0,0,128), color(192,0,192)};
color penColor = color(0,0,0);
int penColorIdx = 0;

float[] penWidths = {0.5, 1, 2, 3, 5, 7};
float penWidth = 1;
int penWidthIdx = 1;
int loadError = 0; // 1 = gears can't snug

void setup() {
  // size(window.innerWidth, window.innerHeight); 
  size(1400, 828);
  ellipseMode(RADIUS);
  // mydebug("test");
  gFont = createFont("Courier", int(32*seventyTwoScale));
  hFont = createFont("Courier", int(18*seventyTwoScale));
  nFont = createFont("Courier", int(11*seventyTwoScale)); // loadFont("Notch-Font.vlw");
  titlePic = loadImage("/petala-title_dark.png");

  gearInit();
  activeGears = new ArrayList<Gear>();
  activeMountPoints = new ArrayList<MountPoint>();
  activeConnectingRods = new ArrayList<ConnectingRod>();
  
  rails = new ArrayList<Channel>();

  // Board Setup
  
  paper = createGraphics(int(paperWidth), int(paperWidth));

  discPoint = new MountPoint("DP", pCenterX, pCenterY);
  
  rails.add(new LineRail(2.22, 10.21, .51, .6));
  rails.add(new LineRail(3.1, 10.23, 3.1, .5));
  rails.add(new LineRail(8.74, 2.41, 9.87, .47));
  rails.add(new ArcRail(pCenterX, pCenterY, 6.54, radians(-68), radians(-5)));
  rails.add(new ArcRail(8.91, 3.91, 7.79, radians(-25), radians(15)));

  float[] rbegD = {
    4.82, 4.96, 4.96, 4.96, 4.96, 4.96
  };
  float[] rendD = {
    7.08, 6.94, 8.46, 7.70, 7.96, 8.48
  };
  float[] rang = {
    radians(-120), radians(-60), radians(-40), radians(-20), 0, radians(20)
  };

  for (int i = 0; i < rbegD.length; ++i) {
      float x1 = pCenterX + cos(rang[i])*rbegD[i];
      float y1 = pCenterY + sin(rang[i])*rbegD[i];
      float x2 = pCenterX + cos(rang[i])*rendD[i];
      float y2 = pCenterY + sin(rang[i])*rendD[i];
      rails.add(new LineRail(x1, y1, x2, y2));
  }

  setupButtons();
  doLoadSetup();
  drawingSetup(setupMode, true);
  buttonFeedback();
}



Gear addGear(int setupIdx, String nom)
{
  Gear g = new Gear(setupTeeth[setupMode][setupIdx], setupIdx, nom);
  activeGears.add(g);
  return g;
}

MountPoint addMP(int setupIdx, String nom, Channel chan)
{
  MountPoint mp = new MountPoint(nom, chan, setupMounts[setupMode][setupIdx], setupIdx);
  activeMountPoints.add(mp);
  return mp;
}

ConnectingRod addCR(int rodNbr, MountPoint slide, MountPoint anchor)
{
  ConnectingRod cr = new ConnectingRod(slide, anchor, rodNbr);
  activeConnectingRods.add(cr);
  return cr;
}

PenRig addPen(MountPoint penMount) {
  return new PenRig(setupPens[setupMode][0], setupPens[setupMode][1], penMount);
}

void drawingSetup(int setupIdx, boolean resetPaper)
{
  setupMode = setupIdx;
  loadError = 0;

  if (resetPaper) {
    isStarted = false;
  }
  penRaised = true;
  myFrameCount = 0;

  activeGears = new ArrayList<Gear>();
  activeMountPoints = new ArrayList<MountPoint>();
  activeConnectingRods = new ArrayList<ConnectingRod>();
  
   // Drawing Setup
  switch (setupIdx) {
  case 0: // simple set up with one gear for pen arm
    turnTable = addGear(0,"Turntable"); 
    crank = addGear(1,"Crank");
    crankRail = rails.get(10);
    pivotRail = rails.get(1);
    crank.mount(crankRail,0);
    turnTable.mount(discPoint, 0);
    crank.snugTo(turnTable);
    crank.meshTo(turnTable);

    slidePoint = addMP(0, "SP", pivotRail);
    anchorPoint = addMP(1, "AP", crank);
    cRod = addCR(0, slidePoint, anchorPoint);

    penMount = addMP(2, "EX", cRod);
    penRig = addPen(penMount);
    break;

  case 1: // moving fulcrum & separate crank
    turnTable = addGear(0,"Turntable"); 
    crank = addGear(1,"Crank");    crank.contributesToCycle = false;
    Gear anchor = addGear(2,"Anchor");
    Gear fulcrumGear = addGear(3,"FulcrumGear");
    crankRail = rails.get(1);
    anchorRail = rails.get(10);
    pivotRail = rails.get(0);
    crank.mount(crankRail, 0); // will get fixed by snugto
    anchor.mount(anchorRail,0);
    fulcrumGear.mount(pivotRail, 0); // will get fixed by snugto
    turnTable.mount(discPoint, 0);

    crank.snugTo(turnTable);
    anchor.snugTo(turnTable);
    fulcrumGear.snugTo(crank);    

    crank.meshTo(turnTable);
    anchor.meshTo(turnTable);
    fulcrumGear.meshTo(crank);   

    slidePoint = addMP(0, "SP", fulcrumGear);
    anchorPoint = addMP(1, "AP", anchor);
    cRod = addCR(0, slidePoint, anchorPoint);
    penMount = addMP(2, "EX", cRod);
    penRig = addPen(penMount);

    break;
    
  case 2: // orbiting gear
    crankRail = rails.get(9);
    anchorRail = rails.get(4);
    pivotRail = rails.get(1);
    
    // Always need these...
    turnTable = addGear(0,"Turntable");
    crank = addGear(1,"Crank");    crank.contributesToCycle = false;
  
    // These are optional
    Gear  anchorTable = addGear(2,"AnchorTable");
    Gear  anchorHub = addGear(3,"AnchorHub"); anchorHub.contributesToCycle = false;
    Gear  orbit = addGear(4,"Orbit");
  
    orbit.isMoving = true;
  
    // Setup gear relationships and mount points here...
    crank.mount(crankRail, 0);
    turnTable.mount(discPoint, 0);
    crank.snugTo(turnTable);
    crank.meshTo(turnTable);
  
    anchorTable.mount(anchorRail, .315); // this is a hack - we need to allow the anchorTable to snug to the crank regardless of it's size...
    anchorTable.snugTo(crank);
    anchorTable.meshTo(crank);

    anchorHub.stackTo(anchorTable);
    anchorHub.isFixed = true;

    orbit.mount(anchorTable,0);
    orbit.snugTo(anchorHub);
    orbit.meshTo(anchorHub);
  
    // Setup Pen
    slidePoint = addMP(0, "SP", pivotRail);
    anchorPoint = addMP(1, "AP", orbit);
    cRod = addCR(0, slidePoint, anchorPoint);
    penMount = addMP(2, "EX", cRod);
    penRig = addPen(penMount);
    break;

  case 3:// 2 pen rails, variation A
    pivotRail = rails.get(1);
    Channel aRail = rails.get(10);
    Channel bRail = rails.get(7);
    turnTable = addGear(0,"Turntable");
    Gear aGear = addGear(1,"A");
    Gear bGear = addGear(2,"B");

    turnTable.mount(discPoint, 0);
    aGear.mount(aRail, 0.5);
    aGear.snugTo(turnTable);
    aGear.meshTo(turnTable);

    bGear.mount(bRail, 0.5);
    bGear.snugTo(turnTable);
    bGear.meshTo(turnTable);

    slidePoint = addMP(0, "SP", aGear);
    anchorPoint = addMP(1, "AP", bGear);
    cRod = addCR(0, slidePoint, anchorPoint);

    MountPoint slidePoint2 = addMP(2, "SP2", pivotRail);
    MountPoint anchorPoint2 = addMP(3, "AP2", cRod);
    ConnectingRod cRod2 = addCR(1, slidePoint2, anchorPoint2);
    penMount = addMP(4,"EX",cRod2);
    penRig = addPen(penMount);

    break;

  case 4: // 2 pen rails, variation B
    pivotRail = rails.get(1);
    aRail = rails.get(10);
    bRail = rails.get(7);
    turnTable = addGear(0,"TurnTable");
    aGear = addGear(1,"A");
    bGear = addGear(2,"B");

    turnTable.mount(discPoint, 0);
    aGear.mount(aRail, 0.5);
    aGear.snugTo(turnTable);
    aGear.meshTo(turnTable);

    bGear.mount(bRail, 0.5);
    bGear.snugTo(turnTable);
    bGear.meshTo(turnTable);

    slidePoint = addMP(0, "SP", pivotRail);
    anchorPoint = addMP(1, "AP", bGear);
    cRod = addCR(0, slidePoint, anchorPoint);

    slidePoint2 = addMP(2, "SP2", aGear);
    anchorPoint2 = addMP(3, "AP2", cRod);
    cRod2 = addCR(1, anchorPoint2, slidePoint2);

    penMount = addMP(4, "EX", cRod2);

    penRig = addPen(penMount);

    break;

  case 5: // 3 pen rails
    pivotRail = rails.get(1);
    aRail = rails.get(10);
    bRail = rails.get(7);
    turnTable = addGear(0,"Turntable");
    aGear = addGear(1,"A");
    bGear = addGear(2,"B");

    turnTable.mount(discPoint, 0);
    aGear.mount(aRail, 0.5);
    aGear.snugTo(turnTable);
    aGear.meshTo(turnTable);

    bGear.mount(bRail, 0.5);
    bGear.snugTo(turnTable);
    bGear.meshTo(turnTable);

    slidePoint = addMP(0, "SP", pivotRail);
    anchorPoint = addMP(1, "AP", bGear);
    cRod = addCR(0, slidePoint, anchorPoint);

    slidePoint2 = addMP(2, "SP2", aGear);
    anchorPoint2 = addMP(3, "AP2", pivotRail);
    cRod2 = addCR(1, slidePoint2, anchorPoint2);

    MountPoint slidePoint3 = addMP(4, "SP3", cRod2);
    MountPoint anchorPoint3 = addMP(5, "SA3", cRod);
    ConnectingRod cRod3 = addCR(2, anchorPoint3, slidePoint3);
    penMount = addMP(6, "EX", cRod3);
    
    penRig = addPen(penMount);

    break;    
  case 6: // orbiting gear with rotating fulcrum (#1 and #2 combined)
    crankRail = rails.get(9);
    anchorRail = rails.get(4);
    // pivotRail = rails.get(1);
    Channel fulcrumCrankRail = rails.get(1);
    Channel fulcrumGearRail = rails.get(0);
    
    // Always need these...
    turnTable = addGear(0,"Turntable");
    crank = addGear(1,"Crank");                            crank.contributesToCycle = false;
  
    // These are optional
    anchorTable = addGear(2,"AnchorTable");
    anchorHub = addGear(3,"AnchorHub");                    anchorHub.contributesToCycle = false;
    orbit = addGear(4,"Orbit");
  
    Gear  fulcrumCrank = addGear(5,"FulcrumCrank");        fulcrumCrank.contributesToCycle = false;       
    fulcrumGear = addGear(6,"FulcrumOrbit");
  
    orbit.isMoving = true;
  
    // Setup gear relationships and mount points here...
    crank.mount(crankRail, 0);
    turnTable.mount(discPoint, 0);
    crank.snugTo(turnTable);
    crank.meshTo(turnTable);
  
    anchorTable.mount(anchorRail, .315);
    anchorTable.snugTo(crank);
    anchorTable.meshTo(crank);

    anchorHub.stackTo(anchorTable);
    anchorHub.isFixed = true;

    orbit.mount(anchorTable,0);
    orbit.snugTo(anchorHub);
    orbit.meshTo(anchorHub);


    fulcrumCrank.mount(fulcrumCrankRail, 0.735+.1);
    fulcrumGear.mount(fulcrumGearRail, 0.29-.1);
    fulcrumCrank.snugTo(turnTable);
    fulcrumGear.snugTo(fulcrumCrank);    

    fulcrumCrank.meshTo(turnTable);
    fulcrumGear.meshTo(fulcrumCrank);   

    // Setup Pen
    slidePoint = addMP(0, "SP", fulcrumGear);
    anchorPoint = addMP(1, "AP", orbit);
    cRod = addCR(0, slidePoint, anchorPoint);
    penMount = addMP(2, "EX", cRod);
    penRig = addPen(penMount);

    break;

  }
  turnTable.showMount = false;
  
}



void draw() 
{


  // Crank the machine a few times, based on current passesPerFrame - this generates new gear positions and drawing output
  for (int p = 0; p < passesPerFrame; ++p) {
    if (isMoving) {
      myFrameCount += drawDirection;
      turnTable.crank(myFrameCount*crankSpeed); // The turntable is always the root of the propulsion chain, since it is the only required gear.

      // work out coords on unrotated paper
      PVector nib = penRig.getPosition();
      float dx = nib.x - pCenterX*inchesToPoints;
      float dy = nib.y - pCenterY*inchesToPoints;
      float a = atan2(dy, dx);
      float l = sqrt(dx*dx + dy*dy);
      float px = paperWidth/2 + cos(a-turnTable.rotation)*l*paperScale;
      float py = paperWidth/2 + sin(a-turnTable.rotation)*l*paperScale;
    
      paper.beginDraw();
      if (!isStarted) {
        // paper.clear();
        paper.smooth(8);
        paper.noFill();
        paper.stroke(penColor);
        paper.strokeJoin(ROUND);
        paper.strokeCap(ROUND);
        paper.strokeWeight(penWidth);
        // paper.rect(10, 10, paperWidth-20, paperWidth-20);
        isStarted = true;
      } else if (!penRaised) {
        paper.line(lastPX, lastPY, px, py);
        jsCapture(lastPX, lastPY, px, py, red(penColor), green(penColor), blue(penColor), penWidth);
      }
      paper.endDraw();
      lastPX = px;
      lastPY = py;
      penRaised = false;
      if (myLastFrame != -1 && myFrameCount >= myLastFrame) {
        myLastFrame = -1;
        passesPerFrame = 1;
        isMoving = false;
        buttonFeedback();
        break;
      }
    }
  }

  // Draw the machine onscreen in it's current state
  background(128);
  pushMatrix();
    image(titlePic, 0, height-titlePic.height);

    drawFulcrumLabels();

    fill(200);
    noStroke();

    float logoScale = inchesToPoints/72.0;

    for (Channel ch : rails) {
       ch.draw();
    }
  
    // discPoint.draw();
  
    for (Gear g : activeGears) {
      if (g != turnTable)
        g.draw();
    }
    turnTable.draw(); // draw this last

    penRig.draw();
  
    pushMatrix();
      translate(pCenterX*inchesToPoints, pCenterY*inchesToPoints);
      rotate(turnTable.rotation);
      image(paper, -paperWidth/(2*paperScale), -paperWidth/(2*paperScale), paperWidth/paperScale, paperWidth/paperScale);
    popMatrix();


    helpDraw(); // draw help if needed

  popMatrix();
}

boolean isShifting = false;

void keyReleased() {
  if (key == CODED) {
    if (keyCode == SHIFT)
      isShifting = false;
  }
}

void keyPressed() {
  switch (key) {
   case ' ':
      isMoving = !isMoving;
      myLastFrame = -1;
      // println("Current cycle length: " + myFrameCount / (TWO_PI/crankSpeed));
     buttonFeedback();

      break;
   case '?':
     toggleHelp();
     break;
   case '0':
     isMoving = false;
     passesPerFrame = 0;
     myLastFrame = -1;
     buttonFeedback();
     // println("Current cycle length: " + myFrameCount / (TWO_PI/crankSpeed));
     break;
   case '1':
     passesPerFrame = 1;
     isMoving = true;
     buttonFeedback();
     break;
   case '2':
   case '3':
   case '4':
   case '5':
   case '6':
   case '7':
   case '8':
   case '9':
      passesPerFrame = int(map((key-'0'),2,9,10,360));
      isMoving = true;
      buttonFeedback();
      break;
   case 'a':
   case 'b':
   case 'c':
   case 'd':
   case 'e':
   case 'f':
   case 'g':
     deselect();
     drawingSetup(key - 'a', false);
     doSaveSetup();
     buttonFeedback();
     break;
   case 'X':
   case 'x':
     clearPaper();
     break;
  case 'p':
    // Swap pen mounts - need visual feedback
    break;
  case '~':
  case '`':
    completeDrawing();
    buttonFeedback();
    break;
  case '[':
    advancePenColor(-1);
    break;
  case ']':
    advancePenColor(1);
    break;
  case '<':
    advancePenWidth(-1);
    break;
  case '>':
    advancePenWidth(1);
    break;
  case '/':
    invertConnectingRod();
    break;
  case '+':
  case '-':
  case '=':
    int direction = (key == '+' || key == '='? 1 : -1);
    nudge(direction, keyCode);
    break;
  case CODED:
  case 65535:
  default:
    switch (keyCode) {
    case UP:
    case DOWN:
    case LEFT:
    case RIGHT:
      direction = (keyCode == RIGHT || keyCode == UP? 1 : -1);
      nudge(direction, keyCode);
      break;
    case SHIFT:
      isShifting = true;
      break;
    default:
     break;
    }
    break;
  }
}

void mouseDragged()
{
  drag();
}

void mouseReleased() {
  isDragging = false;
}

void mousePressed() 
{
  deselect();

  for (MountPoint mp : activeMountPoints) {
    if (mp.isClicked(mouseX, mouseY)) {
      mp.select();
      selectedObject= mp;
      return;
    }
  }
  
  if (penRig.isClicked(mouseX, mouseY)) {
    penRig.select();
    selectedObject= penRig;
    return;
  }

  for (ConnectingRod cr : activeConnectingRods) {
    if (cr.isClicked(mouseX, mouseY)) {
      cr.select();
      selectedObject= cr;
      return;
    }
  }

  for (Gear g : activeGears) {
    if (g.isClicked(mouseX, mouseY)) {
        deselect();
        g.select();
        selectedObject = g;
    }
  }
}


boolean drawHelp = false;
long    helpStartMS = millis();
String[] helpLines = {
    "Keyboard Shortcuts:",
    "",
    "0-9    set drawing speed",
    "a-g    change setups",
    "arrows change gears and mount points",
    "x      erase the paper",
    "[ ]    change pen color",
    "< >    change pen width",
    "/      invert connecting rod",
    "~      draw entire cycle",
};

void helpDraw() 
{
  if (drawHelp) {
    long elapsed = millis() - helpStartMS;
    float alpha = constrain(map(elapsed, 10*1000, 13*1000, 1, 0),0,1);
    if (alpha <= 0.0001) {
      drawHelp = false;
    }
    noStroke();

    float hx = width-500*seventyTwoScale;
    float hy = 30*seventyTwoScale-100*constrain(map(elapsed,0,300,1,0),0,1);
    
    fill(255,alpha*alpha*192);
    rect(hx-8, 0, width-(hx-8), hy + 22*helpLines.length);

    fill(100, alpha*alpha*255);

    textFont(hFont);
    textAlign(LEFT);
    for (int i = 0; i < helpLines.length; ++i) {
      text(helpLines[i], hx, hy+22*i);
    }
  }
}

void toggleHelp() 
{
  if (drawHelp) {
    drawHelp = false;
  } else {
    drawHelp = true;
    helpStartMS = millis();
  }
}

interface Channel {
  PVector getPosition(float r);
  void draw();
  void snugTo(Gear moveable, Gear fixed); // position moveable gear on this channel so it is snug to fixed gear, not needed for all channels
}

interface Selectable {
  void select();
  void unselect();
  void nudge(int direction, int keycode);
}

static final float kMPDefaultRadius = inchesToPoints * 12/72.0;
static final float kMPSlideRadius = inchesToPoints * 20/72.0;
static final float kGearMountRadius = inchesToPoints * 12/72.0;
// static final float kGearNotchWidth = inchesToPoints * 16.5/72.0;
static final float kGearNotchWidth = 5 * mmToInches * inchesToPoints;
static final float kGearNotchHeightMaj = 5 * mmToInches * inchesToPoints;
static final float kGearNotchHeightMin = 3.5 * mmToInches * inchesToPoints;
static final float kGearLabelStart = 0.5*inchesToPoints;
static final float kGearLabelIncr = 0.5*inchesToPoints;
static final float kCRLabelIncr = 0.5*inchesToPoints;
static final float kCRNotchIncr = 0.25*inchesToPoints;
static final float kCRNotchStart = 0.75*inchesToPoints;
static final float kCRLabelStart = 1*inchesToPoints;
static final float kPenLabelStart = 0.5*inchesToPoints;  // was 4.75
static final float kPenLabelIncr =  0.5*inchesToPoints;  // was negative
static final float kPenNotchIncr =  0.25*inchesToPoints; // was negative
static final float kPaperRad = 4.625*inchesToPoints;

class MountPoint implements Channel, Selectable {
  Channel itsChannel = null;
  float itsMountLength;
  int    setupIdx;
  float x, y, radius=kMPDefaultRadius;
  String typeStr = "MP";
  boolean isFixed = false;
  boolean selected = false;
  
  MountPoint(String typeStr, float x, float y) {
    this.typeStr = typeStr;
    this.itsChannel = null;
    this.itsMountLength = 0;
    this.isFixed = true;
    this.setupIdx = -1; // fixed
    this.x = x*inchesToPoints;
    this.y = y*inchesToPoints;
  }

  MountPoint(String typeStr, Channel ch, float mr, int setupIdx) {
    this.typeStr = typeStr;
    this.itsChannel = ch;
    this.itsMountLength = mr;
    this.setupIdx = setupIdx;
    PVector pt = ch.getPosition(mr);
    this.x = pt.x;
    this.y = pt.y;
  }
  
  int chooseBestDirection(int direction, int keycode, float incr) 
  {
    PVector pNeg = itsChannel.getPosition(itsMountLength-incr);
    PVector pPos = itsChannel.getPosition(itsMountLength+incr);
    switch (keycode) {
      case RIGHT:
        return (pPos.x >= pNeg.x)? 1 : -1; 
      case LEFT:
        return (pPos.x <= pNeg.x)? 1 : -1; 
      case UP:
        return (pPos.y <= pNeg.y)? 1 : -1; 
      case DOWN:
        return (pPos.y >= pNeg.y)? 1 : -1; 
      default:
        return direction;      
    }
  }
  
  void nudge(int direction, int keycode) {
    float amt, mn=0, mx=1;
    if (itsChannel instanceof ConnectingRod) {
      amt = 0.125;
      mn = 0.5; 
      mx = 29;
    } else if (itsChannel instanceof Gear) {
      amt = 0.125;
      mn = 0.75;
      mx = ((Gear) itsChannel).radius/(kGearLabelIncr) - 1;
    } else {
      amt = 0.01;
    }
    direction = chooseBestDirection(direction, keycode, amt);
    amt *= direction;
    itsMountLength += amt;
    itsMountLength = constrain(itsMountLength, mn, mx);
    if (setupIdx >= 0) {
      setupMounts[setupMode][setupIdx] = itsMountLength;
    }
  }
  
  float getDistance(float v1, float v2) {
    PVector src = itsChannel.getPosition(v1);
    PVector dst = itsChannel.getPosition(v2);
    return dist(src.x, src.y, dst.x, dst.y);
  }
  
  void unselect() {
    selected = false;
  }
  
  void select() {
    selected = true;
  }

  boolean isClicked(int mx, int my) {
    PVector p = this.getPosition();
    return dist(mx, my, p.x, p.y) <= this.radius;
  }

  PVector getPosition() {
    return getPosition(0.0);
  }

  PVector getPosition(float r) {
    if (itsChannel != null) {
      return itsChannel.getPosition(itsMountLength);
    } else {
      return new PVector(x,y);
    }
  }

  void snugTo(Gear moveable, Gear fixed) { // not meaningful
  }
  
  void draw() {
    PVector p = getPosition();
    if (itsChannel instanceof ConnectingRod) {
      itsChannel.draw();
    } 
    if (selected) {
      fill(180,192);
      stroke(50);
    } else {
      fill(180,192);
      stroke(100);
    }
    strokeWeight(selected? 4 : 2);
    ellipse(p.x, p.y, this.radius, this.radius);
  }
}

class ConnectingRod implements Channel, Selectable {
  MountPoint itsSlide = null;
  MountPoint itsAnchor = null;
  float armAngle = 0;
  int rodNbr = 0;
  boolean selected=false;
  boolean isInverted = false;

  ConnectingRod(MountPoint itsSlide, MountPoint itsAnchor, int rodNbr)
  {
    this.rodNbr = rodNbr;
    this.itsSlide = itsSlide;
    itsSlide.radius = kMPSlideRadius;
    this.itsAnchor = itsAnchor;
    
    if (setupInversions[setupMode][rodNbr])
      invert();
     
  }
  
  PVector getPosition(float r) {
    PVector ap = itsAnchor.getPosition();
    PVector sp = itsSlide.getPosition();
    armAngle = atan2(sp.y - ap.y, sp.x - ap.x);
    float d = notchToDist(r);
    return new PVector(ap.x + cos(armAngle)*d, ap.y + sin(armAngle)*d);
  }  

  void snugTo(Gear moveable, Gear fixed) {
    // not relevant for connecting rods
  }

  void unselect() {
    selected = false;
  }
  
  void select() {
    selected = true;
  }
  
  void invert() {
    this.isInverted = !this.isInverted;
    setupInversions[setupMode][rodNbr] = this.isInverted;

    MountPoint tmp = itsAnchor;
    itsAnchor = itsSlide;
    itsSlide = tmp;
    itsAnchor.radius = kMPDefaultRadius;
    itsSlide.radius = kMPSlideRadius;
    if (penRig != null && penRig.itsRod == this) {
      penRig.angle += 180;
      if (penRig.angle > 360)
        penRig.angle -= 360;
      setupPens[setupMode][1] = penRig.angle;
    }
    doSaveSetup();
  }
  
  void nudge(int direction, int kc) {
    if (kc == UP || kc == DOWN) {
      this.invert();
    }
    else {
      if (penRig.itsRod == this) {
        penRig.itsMP.nudge(direction, kc);
      }
    }
  }

  boolean isClicked(int mx, int my) 
  {
    PVector ap = itsAnchor.getPosition();
    PVector sp = itsSlide.getPosition();

    // mx,my, ap, ep522 293 546.1399 168.98767   492.651 451.97696
    int gr = 5;
    return (mx > min(ap.x-gr,sp.x-gr) && mx < max(ap.x+gr,sp.x+gr) &&
            my > min(ap.y-gr,sp.y-gr) && my < max(ap.y+gr,sp.y+gr) &&
           abs(atan2(my-sp.y,mx-sp.x) - atan2(ap.y-sp.y,ap.x-sp.x)) < radians(10)); 
  }

  float notchToDist(float n) {
    return kCRLabelStart+(n-1)*kCRLabelIncr;
  }

  float distToNotch(float d) {
    return 1 + (d - kCRLabelStart)/kCRLabelIncr;
  }

 
  void draw() {
    PVector ap = itsAnchor.getPosition();
    PVector sp = itsSlide.getPosition();


    itsSlide.draw();
    itsAnchor.draw();

    noFill();
    int shade = selected? 100 : 200;
    int alfa = selected? 192 : 192;
    stroke(shade, alfa);
    strokeWeight(.33*inchesToPoints);
    armAngle = atan2(sp.y - ap.y, sp.x - ap.x);
    // println("Drawing arm " + ap.x/inchesToPoints +" " + ap.y/inchesToPoints + " --> " + sp.x/inchesToPoints + " " + sp.y/inchesToPoints);
    float L = 18 * inchesToPoints;
    line(ap.x,ap.y, ap.x+cos(armAngle)*L, ap.y+sin(armAngle)*L);
    
    stroke(100,100,100,128);
    fill(100,100,100);
    strokeWeight(0.5);
    // float notchOffset = 0.75*inchesToPoints;
    textFont(nFont);
    textAlign(CENTER);
    pushMatrix();
      translate(sp.x,sp.y);
      rotate(atan2(ap.y-sp.y,ap.x-sp.x));
      float ln = dist(ap.x,ap.y,sp.x,sp.y);
      for (int i = 0; i < 29*2; ++i) {
        float x = ln-(kCRNotchStart + kCRNotchIncr*i);
        line(x, 6, x, -(6+(i % 2 == 1? 2 : 0)));
        if (i % 2 == 1) {
          text(""+int(1+i/2),x,8);
        }
      }
    popMatrix();
  }
}

class PenRig implements Selectable {
  float len;
  float angle; // expressed in degrees
  boolean selected = false;
  ConnectingRod itsRod;
  MountPoint itsMP;
  int lastDirection = -1; // these are used to avoid rotational wierdness with manipulations
  long lastRotation = -1;
  int lastKey = -1;


  PenRig(float len, float angle, MountPoint itsMP) {
    this.len = len; // in pen notch units
    this.angle = angle;
    this.itsRod = (ConnectingRod) itsMP.itsChannel;
    this.itsMP = itsMP;

    PVector ap = itsMP.getPosition();
    PVector ep = this.getPosition();
  }

  float notchToDist(float n) {
    return kPenLabelStart+(n-1)*kPenLabelIncr;
  }

  float distToNotch(float d) {
    return 1 + (d - kPenLabelStart)/kPenLabelIncr;
  }

  PVector getPosition() {
    PVector ap = itsMP.getPosition();
    float d = notchToDist(this.len);
    float rangle = radians(this.angle);
    return new PVector(ap.x + cos(itsRod.armAngle + rangle)*d, ap.y + sin(itsRod.armAngle + rangle)*d);
  }

  PVector getPosition(float len, float angle) {
    PVector ap = itsMP.getPosition();
    float d = notchToDist(len);
    float rangle = radians(angle);
    return new PVector(ap.x + cos(itsRod.armAngle + rangle)*d, ap.y + sin(itsRod.armAngle + rangle)*d);
  }

  
  boolean isClicked(int mx, int my) 
  {
    PVector ap = itsMP.getPosition();
    PVector ep = this.getPosition();

    float a = atan2(ap.y-ep.y,ap.x-ep.x);
    float d = 6*inchesToPoints;
    ap.x = ep.x + cos(a)*d;
    ap.y = ep.y + sin(a)*d;

    int gr = 5;
    return (mx > min(ap.x-gr,ep.x-gr) && mx < max(ap.x+gr,ep.x+gr) &&
            my > min(ap.y-gr,ep.y-gr) && my < max(ap.y+gr,ep.y+gr) &&
           abs(atan2(my-ep.y,mx-ep.x) - atan2(ap.y-ep.y,ap.x-ep.x)) < radians(10)); 
  }
  
  void unselect() {
    selected = false;
  }
  
  void select() {
    selected = true;
  }


  int chooseBestDirection(int direction, int keycode, float lenIncr, float angIncr) 
  {
    if (abs(angIncr) > abs(lenIncr) && lastRotation != -1 && (millis()-lastRotation) < 10000) {
      return lastDirection * (lastKey == keycode? 1 : -1);
    } 

    PVector pNeg = getPosition(len -lenIncr, angle-angIncr);
    PVector pPos = getPosition(len +lenIncr, angle+angIncr);

    switch (keycode) {
      case RIGHT:
        return (pPos.x >= pNeg.x)? 1 : -1; 
      case LEFT:
        return (pPos.x <= pNeg.x)? 1 : -1; 
      case UP:
        return (pPos.y <= pNeg.y)? 1 : -1; 
      case DOWN:
        return (pPos.y >= pNeg.y)? 1 : -1; 
      default:
        return direction;      
    }
  }
  
  void nudge(int direction, int kc) {
    float angIncr = 0, lenIncr = 0;
    if (kc == RIGHT || kc == LEFT) {
      angIncr = 5;
    } else {
      lenIncr = 0.125;
    }
    direction = chooseBestDirection(direction, kc, lenIncr, angIncr);
    
    if (abs(angIncr) > abs(lenIncr)) {
      lastRotation = millis();
    }
    lastDirection = direction;
    lastKey = kc;
    
    this.angle += angIncr*direction;
    if (this.angle > 180) {
      this.angle -= 360;
    } else if (this.angle <= -180) {
      this.angle += 360;
    }
    setupPens[setupMode][1] = this.angle;
    this.len += lenIncr*direction;
    this.len = constrain(this.len, 1, 8);
    setupPens[setupMode][0] = this.len;
  }
  
  void draw() {
    itsMP.draw();
    PVector ap = itsMP.getPosition();
    PVector ep = this.getPosition();

    float a = atan2(ap.y-ep.y,ap.x-ep.x);
    float d = 6*inchesToPoints;
    ap.x = ep.x + cos(a)*d;
    ap.y = ep.y + sin(a)*d;

    noFill();
    if (selected)
      stroke(penColor,128);
    else
      stroke(penColor,64);
    strokeWeight(.33*inchesToPoints);
    line(ap.x, ap.y, ep.x, ep.y);
  
    float nibRad = inchesToPoints * 0.111;
  
    strokeWeight(0.5);
    pushMatrix();
      translate(ep.x,ep.y);
      rotate(atan2(ap.y-ep.y,ap.x-ep.x));
      fill(255);
      ellipse(0,0,nibRad,nibRad);
      noFill();
      stroke(192);
      line(-nibRad,0,nibRad,0);
      line(0,nibRad,0,-nibRad);
      
      textFont(nFont);
      textAlign(CENTER);
      fill(penColor);
      noStroke();
      ellipse(0,0,penWidth/2, penWidth/2);

      stroke(96);
      fill(64);
      for (int i = 2; i < 18; ++i) {
        float x = notchToDist(1+i/2.0); // 2, 2.5, 3, 3.5, ....9,5
        line(x, 6, x, -(6+(i % 2 == 0? 2 : 0)));
        if (i % 2 == 0) {
          text(""+int(1+i/2),x,8);
        }
      }
    popMatrix();


  }
}

class LineRail implements Channel {
  float x1,y1, x2,y2;
  LineRail(float x1, float y1, float x2, float  y2) {
    this.x1 = x1*inchesToPoints;
    this.y1 = y1*inchesToPoints;
    this.x2 = x2*inchesToPoints;
    this.y2 = y2*inchesToPoints;
  }
  PVector getPosition(float r) {
    return new PVector(x1+(x2-x1)*r, y1+(y2-y1)*r);
  }  

  void draw() {
    noFill();
    stroke(110);
    strokeWeight(.23*inchesToPoints);

    line(x1,y1, x2,y2);
  }
  
  void snugTo(Gear moveable, Gear fixed) {
    float dx1 = x1-fixed.x;
    float dy1 = y1-fixed.y;
    float dx2 = x2-fixed.x;
    float dy2 = y2-fixed.y;
    float a1 = atan2(dy1,dx1);
    float a2 = atan2(dy2,dx2);
    float d1 = dist(x1,y1,fixed.x,fixed.y);
    float d2 = dist(x2,y2,fixed.x,fixed.y);
    float adiff = abs(a1-a2);
    float r = moveable.radius+fixed.radius+meshGap;
    float mountRatio;
    if (adiff > TWO_PI)
      adiff -= TWO_PI;
    if (adiff < .01) {  // if rail is perpendicular to fixed circle
      mountRatio = (r-d1)/(d2-d1);
      // find position on line (if any) which corresponds to two radii
    } else if ( abs(x2-x1) < .01 ) {
      float m = 0;
      float c = (-m * y1 + x1);
      float aprim = (1 + m*m);
      float bprim = 2 * m * (c - fixed.x) - 2 * fixed.y;
      float cprim = fixed.y * fixed.y + (c - fixed.x) * (c - fixed.x) - r * r;
      float delta = bprim * bprim - 4*aprim*cprim;
      float my1 = (-bprim + sqrt(delta)) / (2 * aprim);
      float mx1 = m * my1 + c;
      float my2 = (-bprim - sqrt(delta)) / (2 * aprim); // use this if it's better
      float mx2 = m * my2 + c;
      if (my1 < min(y1,y2) || my1 > max(y1,y2) || 
          dist(moveable.x,moveable.y,mx2,my2) < dist(moveable.x,moveable.y,mx1,mx2)) {
        mx1 = mx2;
        my1 = my2;
      } 
      if (delta < 0) {
        mountRatio = -1;
      } else {
        mountRatio = dist(x1,y1,mx1,my1)/dist(x1,y1,x2,y2);
      }
    } else { // we likely have a gear on one of the lines on the left
      // given the line formed by x1,y1 x2,y2, find the two spots which are desiredRadius from fixed center.
      float m = (y2-y1)/(x2-x1);
      float c = (-m * x1 + y1);
      float aprim = (1 + m*m);
      float bprim = 2 * m * (c - fixed.y) - 2 * fixed.x;
      float cprim = fixed.x * fixed.x + (c - fixed.y) * (c - fixed.y) - r * r;
      float delta = bprim * bprim - 4*aprim*cprim;
      float mx1 = (-bprim + sqrt(delta)) / (2 * aprim);
      float my1 = m * mx1 + c;
      float mx2 = (-bprim - sqrt(delta)) / (2 * aprim); // use this if it's better
      float my2 = m * mx2 + c;
      if (mx1 < min(x1,x2) || mx1 > max(x1,x2) || my1 < min(y1,y2) || my1 > max(y1,y2) ||
          dist(moveable.x,moveable.y,mx2,my2) < dist(moveable.x,moveable.y,mx1,mx2)) {
        mx1 = mx2;
        my1 = my2;
      }
      if (delta < 0) {
        mountRatio = -1;
      } else {
        mountRatio = dist(x1,y1,mx1,my1)/dist(x1,y1,x2,y2);
      }
    }
    if (mountRatio < 0 || mountRatio > 1 || mountRatio == NaN) {
      loadError = 1;
      mountRatio = 0;
    }
    mountRatio = constrain(mountRatio,0,1);
    moveable.mount(this,mountRatio);
  }
}

class ArcRail implements Channel {
  float cx,cy, rad, begAngle, endAngle;
  ArcRail(float cx, float cy, float rad, float begAngle, float  endAngle) {
    this.cx = cx*inchesToPoints;
    this.cy = cy*inchesToPoints;
    this.rad = rad*inchesToPoints;
    this.begAngle = begAngle;
    this.endAngle = endAngle;  
  }

  PVector getPosition(float r) {
    float a = begAngle + (endAngle - begAngle)*r;
    return new PVector(cx+cos(a)*rad, cy+sin(a)*rad);
  }  

//  fixed = 15.017775 6.61 1.5221801
//  moveable = 16.518276 2.237212 3.0443602
//  rail = 8.91 3.9100003 7.79
//  angles = -24.999998 15.0
//  desired r = 4.625595
//  d = 6.6779423
//  i1 12.791063 2.2343254 ang -23.352594
//  i2 16.517643 2.2343254 ang -12.421739


  void snugTo(Gear moveable, Gear fixed) { // get the movable gear mounted on this rail snug to the fixed gear

    // The fixed gear is surrounded by an imaginary circle which is the correct distance (r) away.
    // We need to intersect this with our arcRail circle, and find the intersection point which lies on the arcrail.
    // Mesh point 
    // https://gsamaras.wordpress.com/code/determine-where-two-circles-intersect-c/

//    println("Snug arcrail");
//    println("  fixed = " + fixed.x/72 + " " + fixed.y/72 + " " + fixed.radius/72);
//    println("  moveable = " + moveable.x/72 + " " + moveable.y/72 + " " + moveable.radius/72);
//    println("  rail = " + cx/72 + " " + cy/72 + " " + rad/72);
//    println("  angles = " + degrees(begAngle) + " " + degrees(endAngle));

   float x1 = fixed.x;
   float y1 = fixed.y;
   float r1 = moveable.radius+fixed.radius+meshGap;
   float x2 = this.cx;
   float y2 = this.cy;
   float r2 = this.rad;

    float d = dist(x1,y1,x2,y2);
    
    if (d > r1+r2) {
      loadError = 1;
      return;
    } else if (abs(d) < .01 && abs(r1-r2) < .01) {
      loadError = 1;
      return;
    } else if (d + min(r1,r2) < max(r1,r2)) {
      loadError = 1;
      return;
    }
    float a = (r1*r1 - r2*r2 + d*d) / (2*d);
    float h = sqrt(r1*r1 - a*a);
    PVector p2 = new PVector( x1 + (a * (x2 - x1)) / d,
                              y1 + (a * (y2 - y1)) / d);
                              
    // these are our two intersection points (which may or may not fall on the arc)
    PVector i1 = new PVector( p2.x + (h * (y2 - y1))/ d,
                              p2.y + (h * (x2 - x1))/ d);
    PVector i2 = new PVector( p2.x - (h * (y2 - y1))/ d,
                              p2.y + (h * (x2 - x1))/ d);

    PVector best = i2;
    float ma = atan2(best.y-cy,best.x-cx);
    if (ma < begAngle || ma > endAngle) {
      best = i1;
      ma = atan2(best.y-cy,best.x-cx);
      if (ma < begAngle || ma > endAngle) {
        loadError = 1;
        return;
      }
    }

    float mountRatio = (ma-begAngle)/(endAngle-begAngle);
    if (mountRatio < 0 || mountRatio > 1)
      loadError = 1;
    moveable.mount(this, mountRatio);
  }

  void draw() {
    noFill();
    stroke(110);
    strokeWeight(.23*inchesToPoints);
    arc(cx, cy, rad, rad, begAngle, endAngle);
  }
}


int[] rgTeeth = { // regular gears
  30, 32, 34, 36, 40, 48, 50, 58, 60, 66, 72, 74, 80, 90, 94, 98, 100, 108, 
 };
int [] ttTeeth = { // turntable gears
   120, 144, 150
};

class GearSetup {
  float notchStart;
  float notchEnd;
  int nbrLabels;
  int teeth;
  GearSetup(int teeth, float notchStart, float notchEnd, int nbrLabels)
  {
    this.teeth = teeth;
    this.notchStart = notchStart * inchesToPoints;
    this.notchEnd = notchEnd * inchesToPoints;
    this.nbrLabels = nbrLabels;
  } 
}

HashMap<Integer, GearSetup> gearSetups;

void gearInit()
{
  gearSetups = new HashMap<Integer, GearSetup>();
  gearSetups.put(108, new GearSetup(108, 0.4375,  3.0,     6));
  gearSetups.put(100, new GearSetup(100, 0.40625, 2.8125,  5));
  gearSetups.put( 98, new GearSetup( 98, 0.4375,  2.8125,  5));
  gearSetups.put( 94, new GearSetup( 94, 0.375,   2.625,   5));
  gearSetups.put( 90, new GearSetup( 90, 0.40625, 2.5,     5));
  gearSetups.put( 80, new GearSetup( 80, 0.40625, 2.25,    4));
  gearSetups.put( 74, new GearSetup( 74, 0.40625, 2.031,   4));
  gearSetups.put( 72, new GearSetup( 72, 0.375,   2.0,     4));
  gearSetups.put( 66, new GearSetup( 66, 0.375,   1.6875,  3));
  gearSetups.put( 60, new GearSetup( 60, 0.3125,  1.625,   3));
  gearSetups.put( 58, new GearSetup( 58, 0.3125,  1.5625,  3));
  gearSetups.put( 50, new GearSetup( 50, 0.25,    1.3125,  2));      // notch joins axel
  gearSetups.put( 48, new GearSetup( 48, 0.375,   1.25,    2));
  gearSetups.put( 40, new GearSetup( 40, 0.25,    1.0,     2));      // notch joins axel
  gearSetups.put( 36, new GearSetup( 36, 0.3125,  0.968,   1));
  gearSetups.put( 34, new GearSetup( 34, 0.3125,  0.84375, 1));
  gearSetups.put( 32, new GearSetup( 32, 0.3125,  0.8125,  1));
  gearSetups.put( 30, new GearSetup( 30, 0.3125,  0.75,    1));
}

class Gear implements Channel, Selectable {
  int teeth;
  int setupIdx;
  float radius;
  float rotation;
  float phase = 0;
  float  x,y;
  float mountRatio = 0;
  boolean doFill = true;
  boolean showMount = true;
  boolean isMoving = false; // gear's position is moving
  boolean isFixed = false; // gear does not rotate or move
  boolean selected = false;
  boolean contributesToCycle = true;
  ArrayList<Gear> meshGears;
  ArrayList<Gear> stackGears;
  Channel itsChannel;
  String nom;
  GearSetup itsSetup;
  
  Gear(int teeth, int setupIdx, String nom) {
    this.itsSetup = gearSetups.get(teeth);
    this.teeth = teeth;
    this.nom = nom;
    this.setupIdx = setupIdx;
    this.radius = (this.teeth*toothRadius/PI);
    this.x = 0;
    this.y = 0;
    this.phase = 0;
    meshGears = new ArrayList<Gear>();
    stackGears = new ArrayList<Gear>();
  }

  boolean isClicked(int mx, int my) {
    return dist(mx, my, this.x, this.y) <= this.radius;
  }

  void unselect() {
    selected = false;
  }
  
  void select() {
    selected = true;
  }
  
  void nudge(int direction, int keycode) {
    int gearIdx = this.setupIdx;
    int teeth, oldTeeth;
    oldTeeth = this.teeth;
    if (isShifting) {
      teeth = setupTeeth[setupMode][gearIdx] + direction;
    } else {
      teeth = findNextTeeth(setupTeeth[setupMode][gearIdx], direction);
    }
    if (teeth < 24) {
      teeth = 150;
    } else if (teeth > 150) {
      teeth = 30;
    }
    setupTeeth[setupMode][gearIdx] = teeth;
    drawingSetup(setupMode, false);
    if (loadError != 0) { // disallow invalid meshes
      // java.awt.Toolkit.getDefaultToolkit().beep();
      setupTeeth[setupMode][gearIdx] = oldTeeth;
      drawingSetup(setupMode, false);
    }
    selectedObject = activeGears.get(gearIdx);
    selectedObject.select();
  }

  
  int findNextTeeth(int teeth, int direction) {
    int[] gTeeth = (this == turnTable? ttTeeth : rgTeeth);

    if (direction == 1) {
        for (int i = 0; i < gTeeth.length; ++i) {
          if (gTeeth[i] > teeth)
            return gTeeth[i];
        }
        return gTeeth[0];
    } else {
        for (int i = gTeeth.length-1; i >= 0; --i) {
          if (gTeeth[i] < teeth)
            return gTeeth[i];
        }
        return gTeeth[gTeeth.length-1];
    }
  }
  


  PVector getPosition(float r) {
    float d = notchToDist(r); // kGearLabelStart+(r-1)*kGearLabelIncr;
    return new PVector(x+cos(this.rotation+this.phase)*d, y+sin(this.rotation+this.phase)*d);
  }  

  void meshTo(Gear parent) {
    parent.meshGears.add(this);

    // work out phase for gear meshing so teeth render interlaced
    float meshAngle = atan2(y-parent.y, x-parent.x); // angle where gears are going to touch (on parent gear)
    if (meshAngle < 0)
      meshAngle += TWO_PI;

    float iMeshAngle = meshAngle + PI;
    if (iMeshAngle >= TWO_PI)
      iMeshAngle -= TWO_PI;

    float parentMeshTooth = (meshAngle - parent.phase)*parent.teeth/TWO_PI; // tooth on parent, taking parent's phase into account
    
    // We want to insure that difference mod 1 is exactly .5 to insure a good mesh
    parentMeshTooth -= floor(parentMeshTooth);
    
    phase = (meshAngle+PI)+(parentMeshTooth+.5)*TWO_PI/teeth;
  }
  
  // Find position in our current channel which is snug to the fixed gear
  void snugTo(Gear anchor) {
    itsChannel.snugTo(this, anchor);
  }
  
  float notchToDist(float n) {
    return kGearLabelStart+(n-1)*kGearLabelIncr;
  }

  float distToNotch(float d) {
    return 1 + (d - kGearLabelStart)/kGearLabelIncr;
  }

  // Using this gear as the channel, find position for moveable gear which is snug to the fixed gear (assuming fixed gear is centered)
  void snugTo(Gear moveable, Gear fixed) {
    float d1 = 0;
    float d2 = radius;
    float d = moveable.radius+fixed.radius+meshGap;

    float mountRadDist = this.radius*d/d2;
    if (mountRadDist < 0 || mountRadDist > this.radius)
      loadError = 1;
    float mountNotch = distToNotch(mountRadDist);

    moveable.mount(this, mountNotch);
      // find position on line (if any) which corresponds to two radii
  }

  void stackTo(Gear parent) {
    parent.stackGears.add(this);
    this.x = parent.x;
    this.y = parent.y;
    this.phase = parent.phase;
  }

  void mount(Channel ch) {
    mount(ch, 0.0);
  }

  void recalcPosition() { // used for orbiting gears
    PVector pt = this.itsChannel.getPosition(this.mountRatio);
    this.x = pt.x;
    this.y = pt.y;
  }

  void mount(Channel ch, float r) {
    this.itsChannel = ch;
    this.mountRatio = r;
    PVector pt = ch.getPosition(r);
    this.x = pt.x;
    this.y = pt.y;
  }

  void crank(float pos) {
    if (!this.isFixed) {
      this.rotation = pos;
      float rTeeth = this.rotation*this.teeth;
      for (Gear mGear : meshGears) {
         mGear.crank(-(rTeeth)/mGear.teeth);
      }
      for (Gear sGear : stackGears) {
         sGear.crank(this.rotation);
      }
      if (isMoving)
       recalcPosition(); // technically only needed for orbiting gears
    }
    else {
      // this gear is fixed, but meshgears will rotate to the passed in pos
      for (Gear mGear : meshGears) {
        mGear.crank(pos + ( pos*this.teeth )/mGear.teeth);
      }
    }
  }

  void draw() {
    strokeWeight(1);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();
    stroke(0);

    pushMatrix();
      translate(this.x, this.y);
      rotate(this.rotation+this.phase);

      float r1 = radius-.07*inchesToPoints;
      float r2 = radius+.07*inchesToPoints;
      float tAngle = TWO_PI/teeth;
      float tipAngle = tAngle*.1;

      if (doFill) {
        fill(220);
      } else {
       noFill();
      }
      if (selected) {
        strokeWeight(4);
        stroke(64);
      } else {
        strokeWeight(0.5);
        stroke(128);
      }
      beginShape();
      for (int i = 0; i < teeth; ++i) {
        float a1 = i*tAngle;
        float a2 = (i+.5)*tAngle;
        vertex(r2*cos(a1), r2*sin(a1));
        vertex(r2*cos(a1+tipAngle), r2*sin(a1+tipAngle));
        vertex(r1*cos(a2-tipAngle), r1*sin(a2-tipAngle));
        vertex(r1*cos(a2+tipAngle), r1*sin(a2+tipAngle));
        vertex(r2*cos(a1+tAngle-tipAngle), r2*sin(a1+tAngle-tipAngle));
        vertex(r2*cos(a1+tAngle), r2*sin(a1+tAngle));
      }
      endShape();

      if (this == turnTable) {
        noStroke();
        fill(255,192);
        beginShape();
        for (int i = 0; i < 8; ++i) {
          vertex(kPaperRad*cos(i*TWO_PI/8), kPaperRad*sin(i*TWO_PI/8));          
        }
        endShape();
      }


      strokeWeight(1);

      pushMatrix();
        translate(0, radius-20);
        fill(127);
        textFont(gFont);
        textAlign(CENTER);
        text(""+teeth, 0, 0);
        noFill();
      popMatrix();

      if (showMount) {
        noStroke();
        fill(192,128);
        ellipse(0, 0, kGearMountRadius, kGearMountRadius);

        pushMatrix();
          float notchStart, notchEnd;
          int   nbrLabels;
          if (itsSetup != null) {
            notchStart = itsSetup.notchStart;
            notchEnd = itsSetup.notchEnd;
            nbrLabels = itsSetup.nbrLabels;
          } else {
            // Make a guesstimate
            notchStart = max(radius*.1,16*seventyTwoScale);
            notchEnd = radius-max(radius*.1,8*seventyTwoScale);
            nbrLabels = 1 + int((notchEnd-notchStart-0.2*inchesToPoints)/(0.5*inchesToPoints));
          }
          textFont(nFont);
          textAlign(CENTER);

          stroke(128);
          fill(128);
          int nbrNotches = (nbrLabels)*2-1;
          for (int i = 0; i < nbrNotches; ++i) {
            float x = kGearLabelStart + i * 0.25 * inchesToPoints;
            line(x,-(i % 2 == 0? kGearNotchHeightMaj : kGearNotchHeightMin), x, (i % 2 == 0? kGearNotchHeightMaj : kGearNotchHeightMin));
            if (i % 2 == 0) {
              text((i/2)+1,x,kGearNotchHeightMaj+0.2*inchesToPoints);
            }
          }
          fill(192);
          noStroke();
          rect(notchStart, -kGearNotchWidth/2, notchEnd-notchStart, kGearNotchWidth);
        popMatrix();
      }
        

    popMatrix();
  }
}


String saveFilename(String prefix)
{
  String sf = prefix + year() + "-" + month() + "-" + day() + "_" + hour() + "." + minute() + "." + second() + ".png";
  return sf;
}


String getSetupString()
{
  String ss = "Setup\t" + ((char) (65+ setupMode)) + "\n";
  ss += "Gear Teeth\t";
  for (int i = 0; i < setupTeeth[setupMode].length; ++i) {
    if (i > 0)  ss += "\t";
    ss += setupTeeth[setupMode][i];
  }
  ss += "\nMount Points\t";
  for (int i = 0; i < setupMounts[setupMode].length; ++i) {
    if (i > 0)  ss += "\t";
    ss += setupMounts[setupMode][i];
  }
  ss += "\n";
  ss += "Pen\t" + penRig.len + "\t" + penRig.angle + "°" + "\n";
  return ss;
}

int GCD(int a, int b) {
   if (b==0) return a;
   return GCD(b,a%b);
}


// Compute total turntable rotations for current drawing
int computeCyclicRotations() {
  int a = 1; // running minimum
  int idx = 0;
  for (Gear g : activeGears) {
    if (g.contributesToCycle && g != turnTable) {
      int ratioNom = turnTable.teeth;
      int ratioDenom = g.teeth;
      if (g.isMoving) { // ! cheesy hack for our orbit configuration, assumes anchorTable,anchorHub,orbit configuration
        ratioNom = turnTable.teeth * (activeGears.get(idx-1).teeth + g.teeth);
        ratioDenom = activeGears.get(idx-2).teeth * g.teeth;
        int gcd = GCD(ratioNom, ratioDenom);
        ratioNom /= gcd;
        ratioDenom /= gcd;
      }
      int b = min(ratioNom,ratioDenom) / GCD(ratioNom, ratioDenom);
      // println(g.teeth  + " " + ratioNom + "/" + ratioDenom + "  b = " + b);
      a = max(a,max(a,b)*min(a,b)/ GCD(a, b));
    }
    idx += 1;
  }
  return a;
}

void invertConnectingRod()
{
  if (selectedObject instanceof ConnectingRod) {
    ((ConnectingRod) selectedObject).invert();
  } else if (activeConnectingRods.size() == 1) {
    activeConnectingRods.get(0).invert();
  } else {
    // ignore it
    // println("Please select a connecting rod to invert");
  }
}

void completeDrawing()
{
    myFrameCount = 0;
    penRaised = true;
    int totalRotations = computeCyclicRotations();
    // println("Total turntable cycles needed = " + totalRotations);
    int framesPerRotation = int(TWO_PI / crankSpeed);
    myLastFrame = framesPerRotation * totalRotations + 1;
    passesPerFrame = 360*2;
    isMoving = true;
}

void clearPaper() 
{
  jsClear();
  paper = createGraphics(paperWidth, paperWidth);
  paper.beginDraw();
    paper.smooth(8);
    paper.noFill();
    paper.stroke(penColor);
    paper.strokeJoin(ROUND);
    paper.strokeCap(ROUND);
    paper.strokeWeight(penWidth);
  paper.endDraw();
}

void nudge(int direction, int kc)
{
  if (selectedObject != null) {
    selectedObject.nudge(direction, kc);
  }
  doSaveSetup();
}

Boolean isDragging = false;
float startDragX = 0, startDragY= 0;

void drag() {
  if (selectedObject != null) {
    int direction=0, keycode=0;

    if (!isDragging) {
      startDragX = pmouseX;
      startDragY = pmouseY;
      isDragging = true;
    }
    //!!  for ConnectingRod - use a similar system as for penrig to move it's mountpoint - do NOT do swaps (maybe do them by double-clicking on swivel?)
    //
    if (selectedObject instanceof Gear) {
      Gear g = (Gear) selectedObject;
      float dm = dist(mouseX, mouseY, g.x, g.y);
      float ds = dist(startDragX, startDragY, g.x, g.y);
      if (abs(dm-ds) > 10) {
        direction = (dm > ds)? 1 : -1;
        keycode = (direction == 1)? UP : DOWN;
        startDragX = mouseX;
        startDragY = mouseY;
      }
    } else if (selectedObject instanceof PenRig) {
      // For pen arm, use startX, endX to get closest anchor point on pen arm.  Then reposition/rotate so that anchorP is as close as possible to mouseX/mouseY
      // using proper penarm quantization.
      // we solve rotation first (using mouse -> arm pivot, translated for parent), then length is fairly easy.
      //
      PenRig pr = (PenRig) selectedObject;
      float dm = dist(mouseX, mouseY, startDragX, startDragX);
      if (abs(dm) > 10) {
        PVector ap = pr.itsMP.getPosition(); // position of mount
        PVector pp = pr.getPosition(); // position of pen
        float startDragLen = dist(startDragX,startDragY,pp.x,pp.y);
        float gPenAngle, lenScale;
        if (startDragLen/(0.5*inchesToPoints) > pr.len) {
          // We are on opposite side of mount point from pen
          gPenAngle = atan2(ap.y-pp.y,ap.x-pp.x); // this is for moving pen when we're on the opposite side from pen
          lenScale= -1;
        } else {
          gPenAngle = atan2(pp.y-ap.y,pp.x-ap.x); // this causes us to be moving pen arm if we're close to pen...
          lenScale = 1;
        }
        float lAngleOffset = radians(pr.angle) - gPenAngle; // adjustment to stored angle, in radians
        float desiredAngle = atan2(mouseY-ap.y,mouseX-ap.x);
        pr.angle = degrees(desiredAngle+lAngleOffset);
        pr.angle = round(pr.angle / 5)*5;
        float oLen = dist(startDragX,startDragY,ap.x,ap.y);
        float desLen = dist(mouseX, mouseY, ap.x, ap.y);
        pr.len += lenScale*(desLen-oLen)/(0.5*inchesToPoints);
        pr.len = round(pr.len / 0.125)*0.125;
        setupPens[setupMode][1] = pr.angle;
        setupPens[setupMode][0] = pr.len;
        doSaveSetup();
        startDragX = mouseX;
        startDragY = mouseY;
      }
    } else {
      float dm = dist(mouseX, mouseY, startDragX, startDragX);
      if (abs(dm) > 10) {
        float a = atan2(mouseY-startDragY, mouseX-startDragX);
        if (a >= -PI/4 && a <= PI/4) {
          direction = 1;
          keycode = RIGHT;
        } else if (a >= 3*PI/4 || a <= -3*PI/4) {
          direction = -1;
          keycode = LEFT;
        } else if (a >= -3*PI/4 && a <= -PI/4) {
          direction = 1;
          keycode = UP;
        } else if (a >= PI/4 && a <= 3*PI/4) {
          direction = -1;
          keycode = DOWN;
        }
        startDragX = mouseX;
        startDragY = mouseY;
      }
    }
    if (direction != 0)
      nudge(direction, keycode);
  }
}

void deselect() {
  if (selectedObject != null) {
    selectedObject.unselect();
    selectedObject = null;
  }
}

void advancePenColor(int direction) {
  penColorIdx = (penColorIdx + penColors.length + direction) % penColors.length;
  penColor = penColors[penColorIdx]; 
  paper.beginDraw();
  paper.stroke(penColor);
  paper.endDraw();
  if (direction != 0) {
    doSaveSetup();
  }
}

void advancePenWidth(int direction) {
  penWidthIdx = (penWidthIdx + penWidths.length + direction) % penWidths.length;
  penWidth = penWidths[penWidthIdx]; 
  paper.beginDraw();
  paper.strokeWeight(penWidth);
  paper.endDraw();
  if (direction != 0) {
    doSaveSetup();
  }
}

void drawFulcrumLabels() {
    textFont(nFont);
    textAlign(CENTER);
    fill(64);
    stroke(92);
    strokeWeight(0.5);
    pushMatrix();
      translate(3.1*inchesToPoints, 10.23*inchesToPoints);
      rotate(PI/2);
      int nbrNotches = 39;
      float startNotch = 0.25*inchesToPoints;
      float notchIncr = 0.25*inchesToPoints;
      float minNotch = 0.9*inchesToPoints;
      float lilNotch = minNotch/2;
      float widIncr = 1.722*inchesToPoints/nbrNotches;
      float notchSize = minNotch;
      float notchX = -startNotch;
      for (int n = 0; n < 39; ++n) {
        line(notchX,0,notchX,n % 2 == 1? notchSize : lilNotch);
        if (n % 2 == 1) {
          text("" + int(n/2+1),notchX,lilNotch); 
        }
        notchSize += widIncr;
        notchX -= notchIncr;
      }
    popMatrix();

}

class CDMSSetup {
  int[][] setupTeeth;
  float[][] setupMounts;
  float[][] setupPens;
  Boolean[][] setupInversions;
  int penColorIdx, penWidthIdx;

  CDMSSetup(int setupMode, int penColorIdx, int penWidthIdx, int[][] setupTeeth, float[][] setupMounts, float[][] setupPens, Boolean[][] setupInversions)
  {
    this.penColorIdx = penColorIdx;
    this.penWidthIdx = penWidthIdx;
    this.setupMode = setupMode;
    this.setupTeeth = setupTeeth;
    this.setupMounts = setupMounts;
    this.setupPens = setupPens;
    this.setupInversions = setupInversions;
  }
};


void doSaveSetup()
{
  CDMSSetup tsetup = new CDMSSetup(setupMode, penColorIdx, penWidthIdx, setupTeeth, setupMounts, setupPens, setupInversions);
  jsSaveSetups(tsetup);
}

void doLoadSetup()
{
  CDMSSetup tsetup = new CDMSSetup(setupMode, penColorIdx, penWidthIdx, setupTeeth, setupMounts, setupPens, setupInversions);
  jsLoadSetups(tsetup);
  setupTeeth = tsetup.setupTeeth;
  setupMounts = tsetup.setupMounts;
  setupPens = tsetup.setupPens;
  setupInversions = tsetup.setupInversions;
  setupMode = tsetup.setupMode;
  penColorIdx = tsetup.penColorIdx;
  penWidthIdx = tsetup.penWidthIdx;
  advancePenColor(0);
  advancePenWidth(0);
}

void doSnapshot() 
{
  //
  // background(255);
  // image(paper,0,0);
  // save("untitled.png");
  makeSnapshot(paper, turnTable.rotation, saveFilename("cdm_"));
}

void issueCmd(String cmd, String subcmd) {
  if (cmd.equals("play")) {
      passesPerFrame = 1;
      isMoving = true;
      drawDirection = 1;
      myLastFrame = -1;
  } else if (cmd.equals("pause")) {
      isMoving = false;
      drawDirection = 1;
      myLastFrame = -1;
  } else if (cmd.equals("ff")) {
      passesPerFrame = 10;
      drawDirection = 1;
      isMoving = true;
  } else if (cmd.equals("fff")) {
      drawDirection = 1;
      completeDrawing();
  } else if (cmd.equals("rr")) {
      drawDirection = -1;
      passesPerFrame = 1;
      isMoving = true;
  } else if (cmd.equals("rrr")) {
      drawDirection = -1;
      passesPerFrame = 10;
      isMoving = true;
  } else if (cmd.equals("erase")) {
      clearPaper();
  } else if (cmd.equals("setup")) {
      int setupMode = int(subcmd);
      deselect();
      drawingSetup(setupMode, false);
      doSaveSetup();
  } else if (cmd.equals("snapshot")) {
    doSnapshot();
  } else if (cmd.equals("help")) {
    toggleHelp();
    // alert("Help is coming soon...");
  }
}

String getSetupMode()
{
  return setupMode;
}

int getDrawDirection()
{
  return drawDirection;
}

int getPassesPerFrame()
{
  return passesPerFrame;
}

Boolean getIsMoving()
{
  return isMoving;
}


void applyNineLobes() {
  isMoving = false;
  setupTeeth[6] = new int[]{144,50,80,34,40,50,40};
  setupMounts[6] = new float[]{2.5,1,13};
  setupPens[6] = new float[]{6.5,-90};
  setupInversions[6] = new Boolean[]{false};
  deselect();
  drawingSetup(6,true);
  doSaveSetup();
  buttonFeedback();
}
