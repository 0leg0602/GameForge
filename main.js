import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ConvexObjectBreaker } from "three/addons/misc/ConvexObjectBreaker.js";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

import { TTFLoader } from "three/addons/loaders/TTFLoader.js";
import { Font } from "three/addons/loaders/FontLoader.js";

// - Global variables -

let deg = Math.PI / 180;

// Graphics variables
let container;
let camera, controls, scene, renderer;
let textureLoader;
const font_loader = new TTFLoader();
const clock = new THREE.Clock();

let mixer;
let clip_action;

let font_norm;
let font_bold;
let controls_img;
let arrow_img;
let instagram_logo;
let tiktok_logo;
let twitter_logo;
let facebook_logo;

let business_plan_img;
// Physics variables
const gravityConstant = 7.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;
let physicsWorld;
const margin = 0.05;

const null_pos = new THREE.Vector3();

const convexBreaker = new ConvexObjectBreaker();

// Rigid bodies include all movable objects
const rigidBodies = [];

let ballBody = null;
let ball = null;

let ball_dir_horizontal = "none";
let ball_dir_vertical = "none";

const pos = new THREE.Vector3();
const rot = new THREE.Vector3();
const quat = new THREE.Quaternion();
let transformAux1;
let tempBtVec3_1;

// - Main code -

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib;

  let transform = new Ammo.btTransform();

  window.tmpTrans = transform;

  init();
});

// - Functions -

function init() {
  font_loader.load("resources/fonts/TurretRoad-Regular.ttf", function (json) {
    font_norm = new Font(json);
    font_bold = new Font(json);
    controls_img = new THREE.TextureLoader().load(
      "resources/images/controls.png",
      function () {
        arrow_img = new THREE.TextureLoader().load(
          "resources/images/arrow.png",
          function () {
            instagram_logo = new THREE.TextureLoader().load(
              "resources/images/Instagram_logo.png",
              function () {
                tiktok_logo = new THREE.TextureLoader().load(
                  "resources/images/tiktok_logo.png",
                  function () {
                    twitter_logo = new THREE.TextureLoader().load(
                      "resources/images/twitter_logo.png",
                      function () {
                        facebook_logo = new THREE.TextureLoader().load(
                          "resources/images/facebook_logo.png",
                          function () {
                            business_plan_img = new THREE.TextureLoader().load(
                              "resources/images/business_plan.png",
                              function () {
                                after_load();
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

function after_load() {
  initGraphics();

  initPhysics();

  createObjects();

  initInput();
}

function initGraphics() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    2000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);

  camera.position.set(0, 25, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.update();

  textureLoader = new THREE.TextureLoader();

  const ambientLight = new THREE.AmbientLight(0xbbbbbb);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-10, 18, 5);
  light.castShadow = true;
  const d = 60;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;

  light.shadow.camera.near = 2;
  light.shadow.camera.far = 40;

  light.shadow.mapSize.x = 4024;
  light.shadow.mapSize.y = 4024;

  scene.add(light);

  //

  window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
  // Physics configuration

  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  broadphase = new Ammo.btDbvtBroadphase();
  solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  );
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

  transformAux1 = new Ammo.btTransform();
  tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
}

function createObjects() {
  // Ground

  pos.set(0, -0.5, 0);
  create_box(pos, 40, 1, 40);

  pos.set(20, 2, 0);
  create_box(pos, 1, 4, 40);

  pos.set(-20, 2, 0);
  create_box(pos, 1, 4, 40);

  pos.set(-5, 2, 20);
  create_box(pos, 30, 4, 1);

  pos.set(0, 2, -20);
  create_box(pos, 40, 4, 1);

  // Level 2

  pos.set(13, -0.5, 50);
  create_box(pos, 50, 1, 60);

  pos.set(29, 2, 20);
  create_box(pos, 18, 4, 1);

  pos.set(38, 2, 34);
  create_box(pos, 1, 4, 5);

  // Social media

  pos.set(53, -0.5, 17);
  create_box(pos, 30, 1, 30);

  // bottom

  pos.set(53, 2, 32);
  create_box(pos, 30, 4, 1);

  // top

  pos.set(53, 2, 2);
  create_box(pos, 30, 4, 1);

  // right

  pos.set(68, 2, 17);
  create_box(pos, 1, 4, 30);

  // left

  pos.set(38, 2, 11);
  create_box(pos, 1, 4, 18);

  // Giving back

  // platform

  pos.set(53, -0.5, 51);
  create_box(pos, 30, 1, 30);

  // bottom

  pos.set(53, 2, 36);
  create_box(pos, 30, 4, 1);

  // top

  pos.set(53, 2, 66);
  create_box(pos, 30, 4, 1);

  // right

  pos.set(68, 2, 51);
  create_box(pos, 1, 4, 30);

  // left

  pos.set(38, 2, 55);
  create_box(pos, 1, 4, 22);

  // business plan

  // bridge

  pos.set(-19.5, -0.5, 26);
  create_box(pos, 15, 1, 6);

  // platform

  pos.set(-43, -0.5, 0);
  create_box(pos, 32, 1, 57);

  // top

  pos.set(-43, 2, -28.5);
  create_box(pos, 32, 4, 1);

  // bottom

  pos.set(-43, 2, 29);
  create_box(pos, 32, 4, 1);

  // right

  pos.set(-59, 2, 0);
  create_box(pos, 1, 4, 57);

  // left

  pos.set(-27, 2, -3);
  create_box(pos, 1, 4, 52);

  // Services offered

  pos.set(-19.5, -0.5, 40);
  create_box(pos, 15, 1, 6);

  // platform

  pos.set(-42, -0.5, 52);
  create_box(pos, 30, 1, 30);

  pos.set(-42, 2, 37);
  create_box(pos, 30, 4, 1);

  // 	Ball

  const ballMass = 35;
  const ballRadius = 1;

  ball = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 50, 10),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );

  textureLoader.load("resources/textures/grid.png", function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    ball.material.map = texture;
    ball.material.needsUpdate = true;
  });

  ball.castShadow = true;
  ball.receiveShadow = true;

  // scene.add(ball)

  const ballShape = new Ammo.btSphereShape(ballRadius);
  ballShape.setMargin(margin);
  pos.set(0, 0, 0);
  quat.set(0, 0, 0, 1);

  ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

  window.ballBody = ballBody;
  window.ball = ball;

  // create a ClipAction and set it to play
  clip_action = set_clip_action([0, 1, 2], [0, 10, -100, 0, 10, 0, 0, 0, 0]);
  clip_action.play();

  window.clipAction = clip_action;

  //   Turorial image

  pos.set(0, 0.1, -9);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(controls_img, pos, rot, 10);

  // Tutorial text

  pos.set(0, 0.1, -4.6);

  console.log(font_norm);

  create_text("    use WASD or\narrow keys to move", font_norm, pos, 2);

  pos.set(0, 0.1, 3);

  let material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("orange"),
      },
      color2: {
        value: new THREE.Color("blue"),
      },
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y-0.9), 1.0);
      }
    `,
    // wireframe: true
  });

  create_text("GameForge", font_norm, pos, 4, material);

  pos.set(-10, 0.1, 15);
  create_text("Made by Oleg ", font_norm, pos, 2);

  pos.set(0, 0.1, 9);
  rot.set(-Math.PI / 2, 0, -deg * 25);

  create_sprite(arrow_img, pos, rot, 10);

  pos.set(15, 0.1, 35);
  create_text("ABOUT ", font_norm, pos, 2);

  pos.set(15, 0.1, 38);
  rot.set(-Math.PI / 2, 0, -deg * 90);

  create_sprite(arrow_img, pos, rot, 5);

  pos.set(25, 0.1, 27);
  create_text("SOCIAL\nMEDIA", font_norm, pos, 2);

  pos.set(33, 0.1, 27);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(arrow_img, pos, rot, 5);

  pos.set(3, 0.1, 27);
  create_text("BUSINESS\n   PLAN", font_norm, pos, 2);

  pos.set(-7, 0.1, 27);
  rot.set(-Math.PI / 2, 0, deg * 180);

  create_sprite(arrow_img, pos, rot, 5);

  pos.set(3, 0.1, 40);
  create_text("SERVICES\nOFFERED", font_norm, pos, 2);

  pos.set(-7, 0.1, 40);
  rot.set(-Math.PI / 2, 0, deg * 180);

  create_sprite(arrow_img, pos, rot, 5);

  pos.set(25, 0.1, 40);
  create_text("GIVING\n BACK", font_norm, pos, 2);

  pos.set(33, 0.1, 40);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(arrow_img, pos, rot, 5);

  // About

  material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color("orange"),
      },
      color2: {
        value: new THREE.Color("blue"),
      },
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y-0.4), 1.0);
      }
    `,
    // wireframe: true
  });

  pos.set(-3, 0.1, 55);

  create_text("GameForge", font_norm, pos, 2, material);

  pos.set(16, 0.1, 55);

  create_text(
    "        is a service that connects \ngame developers with people\n     who want to create\n    their own video games\n    and have a great idea,\nbut lack the necessary skills\nto make the game themselves.",
    font_norm,
    pos,
    1.8
  );

  // Social media

  pos.set(48, 0.1, 6);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(instagram_logo, pos, rot, 6);

  pos.set(48, 0.1, 12);

  create_text("instagram", font_norm, pos, 2);

  pos.set(60, 0.1, 6);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(tiktok_logo, pos, rot, 7);

  pos.set(60, 0.1, 12);

  create_text("tiktok", font_norm, pos, 2);

  pos.set(48, 0.1, 18);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(facebook_logo, pos, rot, 6);

  pos.set(48, 0.1, 24);

  create_text("facebook", font_norm, pos, 2);

  pos.set(60, 0.1, 18);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(twitter_logo, pos, rot, 6);

  pos.set(60, 0.1, 24);

  create_text("twitter", font_norm, pos, 2);

  // business_plan

  pos.set(-43, 0.1, 0.8);
  rot.set(-Math.PI / 2, 0, 0);

  create_sprite(business_plan_img, pos, rot, 30);
}

function set_clip_action(times, positions) {
  const positionKF = new THREE.VectorKeyframeTrack(
    ".position",
    times,
    positions
  );
  const clip = new THREE.AnimationClip("Action", -1, [positionKF]);

  // setup the THREE.AnimationMixer
  mixer = new THREE.AnimationMixer(ball);

  let created_clip_action = mixer.clipAction(clip);

  created_clip_action.repetitions = 1;
  created_clip_action.clampWhenFinished = true;

  return created_clip_action;
}

function move_ball_to(place) {
  if (place == "home") {
    clip_action = set_clip_action(
      [0, 1, 2, 3],
      [
        ball.position.x,
        ball.position.y,
        ball.position.z,
        ball.position.x,
        10,
        ball.position.z,
        0,
        10,
        0,
        0,
        0,
        0,
      ]
    );
  } else if (place == "table_of_contents") {
    clip_action = set_clip_action(
      [0, 1, 2, 3],
      [
        ball.position.x,
        ball.position.y,
        ball.position.z,
        ball.position.x,
        10,
        ball.position.z,
        15,
        10,
        34,
        15,
        0,
        34,
      ]
    );
  } else if (place == "social_media") {
    clip_action = set_clip_action(
      [0, 1, 2, 3],
      [
        ball.position.x,
        ball.position.y,
        ball.position.z,
        ball.position.x,
        10,
        ball.position.z,
        53,
        10,
        17,
        53,
        0,
        17,
      ]
    );
  } else if (place == "business_plan") {
    clip_action = set_clip_action(
      [0, 1, 2, 3],
      [
        ball.position.x,
        ball.position.y,
        ball.position.z,
        ball.position.x,
        10,
        ball.position.z,
        -42,
        10,
        14,
        -42,
        0,
        14,
      ]
    );
  } else if (place == "about") {
    clip_action = set_clip_action(
      [0, 1, 2, 3],
      [
        ball.position.x,
        ball.position.y,
        ball.position.z,
        ball.position.x,
        10,
        ball.position.z,
        15,
        10,
        57,
        15,
        0,
        57,
      ]
    );
  }
  clip_action.play();
}

window.move_ball_to = move_ball_to;

function create_sprite(img, pos, rot, scale) {
  // window.img = img;
  let geometry = new THREE.PlaneGeometry(
    scale,
    scale / (img.source.data.width / img.source.data.height)
  );
  let material = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    map: img,
  });
  const controls_plane = new THREE.Mesh(geometry, material);
  controls_plane.position.set(pos.x, pos.y, pos.z);
  console.log(pos);
  controls_plane.rotation.set(rot.x, rot.y, rot.z);
  scene.add(controls_plane);
}

function create_box(pos, width, height, length) {
  quat.set(0, 0, 0, 1);
  const box = createParalellepipedWithPhysics(
    width,
    height,
    length,
    0,
    pos,
    quat,
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  box.receiveShadow = true;
  textureLoader.load("resources/textures/grid.png", function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width, length);
    box.material.map = texture;
    box.material.needsUpdate = true;
  });
}

function create_text(message, font, pos, size, material) {
  const color = "black";

  console.log(font);

  if (material == undefined) {
    material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      // opacity: 0.8,
      side: THREE.DoubleSide,
    });
  }

  const shapes = font.generateShapes(message, size);

  const geometry = new THREE.ShapeGeometry(shapes);

  geometry.computeBoundingBox();

  const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

  geometry.translate(xMid, 0, 0);

  // make shape ( N.B. edge view not visible )

  const text = new THREE.Mesh(geometry, material);
  // text.position.z = -150;
  text.position.x = pos.x;
  text.position.y = pos.y;
  text.position.z = pos.z;

  // text.position = pos;

  text.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(text);

  render();
}

function createParalellepipedWithPhysics(
  sx,
  sy,
  sz,
  mass,
  pos,
  quat,
  material
) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    material
  );
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
  );
  shape.setMargin(margin);

  createRigidBody(object, shape, mass, pos, quat);

  return object;
}

function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  if (pos) {
    object.position.copy(pos);
  } else {
    pos = object.position;
  }

  if (quat) {
    object.quaternion.copy(quat);
  } else {
    quat = object.quaternion;
  }

  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    physicsShape,
    localInertia
  );
  const body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(1);

  if (vel) {
    body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if (angVel) {
    body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);

  if (mass > 0) {
    rigidBodies.push(object);

    // Disable deactivation
    body.setActivationState(4);
  }

  physicsWorld.addRigidBody(body);

  return body;
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24));
}

function createMaterial(color) {
  color = color || createRandomColor();
  return new THREE.MeshPhongMaterial({ color: color });
}

function initInput() {
  window.addEventListener("keydown", function (event) {
    // console.log(event.code);

    if (event.code === "KeyW" || event.code === "ArrowUp") {
      ball_dir_vertical = "forward";
    } else if (event.code === "KeyS" || event.code === "ArrowDown") {
      ball_dir_vertical = "backward";
    } else if (event.code === "KeyA" || event.code === "ArrowLeft") {
      ball_dir_horizontal = "left";
    } else if (event.code === "KeyD" || event.code === "ArrowRight") {
      ball_dir_horizontal = "right";
    }
  });

  window.addEventListener("keyup", function (event) {
    // console.log(event.code);
    if (
      (event.code === "KeyW" && ball_dir_vertical === "forward") ||
      (event.code === "ArrowUp" && ball_dir_vertical === "forward")
    ) {
      ball_dir_vertical = "none";
    }
    if (
      (event.code === "KeyS" && ball_dir_vertical === "backward") ||
      (event.code === "ArrowDown" && ball_dir_vertical === "backward")
    ) {
      ball_dir_vertical = "none";
    }
    if (
      (event.code === "KeyA" && ball_dir_horizontal === "left") ||
      (event.code === "ArrowLeft" && ball_dir_horizontal === "left")
    ) {
      ball_dir_horizontal = "none";
    }
    if (
      (event.code === "KeyD" && ball_dir_horizontal === "right") ||
      (event.code === "ArrowRight" && ball_dir_horizontal === "right")
    ) {
      ball_dir_horizontal = "none";
    }
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  render();
}

function render() {
  const deltaTime = clock.getDelta();

  if (mixer !== "undefined" && clip_action.enabled && !clip_action.paused) {
    mixer.update(deltaTime);
    ballBody.getWorldTransform().getOrigin().setX(ball.position.x);
    ballBody.getWorldTransform().getOrigin().setY(ball.position.y);
    ballBody.getWorldTransform().getOrigin().setZ(ball.position.z);

    ballBody.setLinearVelocity(null_pos);
    ballBody.setAngularVelocity(null_pos);
    console.log("running");
  } else {
  }

  window.mixer = mixer;
  window.pos = pos;

  camera.position.set(
    ball.position.x,
    ball.position.y + 25,
    ball.position.z + 5
  );

  if (ball.position.y < -10) {
    move_ball_to("table_of_contents");
  }

  updatePhysics(deltaTime);

  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  window.camera = camera;

  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);

  let speed = 200;

  switch (ball_dir_horizontal) {
    case "right":
      ballBody.applyTorque(new Ammo.btVector3(0, 0, -speed));
      break;
    case "left":
      ballBody.applyTorque(new Ammo.btVector3(0, 0, speed));
      break;
  }
  switch (ball_dir_vertical) {
    case "forward":
      ballBody.applyTorque(new Ammo.btVector3(-speed, 0, 0));
      break;
    case "backward":
      ballBody.applyTorque(new Ammo.btVector3(speed, 0, 0));
      break;
  }

  // camera.position =

  // Update rigid bodies
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i];
    const objPhys = objThree.userData.physicsBody;
    const ms = objPhys.getMotionState();

    if (ms) {
      ms.getWorldTransform(transformAux1);
      const p = transformAux1.getOrigin();
      const q = transformAux1.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      objThree.userData.collided = false;
    }
  }
}
