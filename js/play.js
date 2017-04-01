
// window.onload = function(){
//   CSW = new Phaser.Game(CSW.configs.GAME_WIDTH,CSW.configs.GAME_HEIGHT,Phaser.AUTO,'',
//     {
//       preload: preload,
//       create: create,
//       update: update,
//       render: render
//     }, false, false
//   );
// }

var playState={


// preparations before game starts
 preload : function(){
  CSW.scale.pageAlignVertically = true;
  CSW.scale.pageAlignHorizontally = true;
  CSW.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

  CSW.time.advancedTiming = true;

  //CSW.load.image('background', 'Assets/Map1.png');
  CSW.load.atlasJSONHash('assets', 'Assets/Textures/buttons.png', 'Assets/Textures/buttons.json');
  CSW.load.image('player','Assets/Textures/Player/Player.png');
  CSW.load.image('circle_cyan','Assets/Textures/Obstacles/Circle/cyan.png');
  CSW.load.image('circle_pink','Assets/Textures/Obstacles/Circle/pink.png');
  CSW.load.image('circle_purple','Assets/Textures/Obstacles/Circle/purple.png');
  CSW.load.image('circle_yellow','Assets/Textures/Obstacles/Circle/yellow.png');
  CSW.load.image('stripe_cyan','Assets/Textures/Obstacles/Stripes/cyan.png');
  CSW.load.image('stripe_pink','Assets/Textures/Obstacles/Stripes/pink.png');
  CSW.load.image('stripe_purple','Assets/Textures/Obstacles/Stripes/purple.png');
  CSW.load.image('stripe_yellow','Assets/Textures/Obstacles/Stripes/yellow.png');
  CSW.load.image('switch','Assets/Textures/Obstacles/switch.png');
  CSW.load.image('star','Assets/Textures/Obstacles/Star/Star.png');
  CSW.load.physics('circle_physics','Assets/Textures/Obstacles/Circle/circle.json');
  CSW.load.physics('stripe_physics','Assets/Textures/Obstacles/Stripes/stripe.json');

  // CSW.scale.pageAlignHorizontally = true;
  // CSW.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
},

// initialize the game
 create : function(){
  CSW.world.setBounds(0, 0, CSW.configs.GAME_WIDTH, CSW.configs.GAME_HEIGHT);
  CSW.physics.startSystem(Phaser.Physics.P2JS);

  CSW.keyboard = CSW.input.keyboard;
  CSW.playerGroup = CSW.add.physicsGroup();
  // CSW.obstacleGroup = CSW.add.physicsGroup();
  // CSW.obstacleGroup.getFirstDead();



  CSW.player = new PlayerController({
    TAP:Phaser.Keyboard.SPACEBAR,
    speed: 1,
    direction: new Phaser.Point(0,600)
  },"purple");
  CSW.physics.p2.enable([CSW.player.sprite],false);

  //Object trong pool có index càng lớn thì độ khó của nó càng lớn
  CSW.pool = [];

  CSW.switch = new SwitchController({x: 320, y: 0});
  CSW.pool.push(new CircleController({x: 320, y: 0}));
  CSW.pool.push(new StripeController({x: 400, y: 400}));
  CSW.pool.push(new StripeController({x: 400, y: 400}));
  CSW.pool.push(new CircleController({x: 320, y: 0}));
  CSW.star = new StarController({x: 320, y: -200});
  //lever quyết định cách thức lấy object từ pool, lever càng cao xác suất lấy object có index cao càng lớn
  //lever tăng khi ăn switch
  //lever max là CSW.pool.length
  CSW.lever = 3;

  //Để chắc chắn rằng ban đầu chỉ có 2 Object trong pool được dùng
  for (let i = 2; i < CSW.pool.length; i++) {
    CSW.pool[i].parts.forEach(function(part){
      part.kill();
    });
    CSW.pool[i].used = false;
    CSW.pool[i].position.y = -99999;
  }

  CSW.pool.forEach(function(obstacle) {
    obstacle.update();
  });

  CSW.player.sprite.body.onBeginContact.add(this.blockHit, this);


  CSW.physics.p2.enable(CSW.player,CSW.circle, CSW.Stripe);

  CSW.camera.follow(CSW.player.sprite);
  CSW.camera.deadzone = new Phaser.Rectangle(0, CSW.configs.GAME_HEIGHT/2, CSW.configs.GAME_WIDTH, CSW.configs.GAME_HEIGHT/2);

  console.log("Lever hiện tại: "+ CSW.lever);
},

// update game state each frame
 update : function(){
  CSW.player.update();
  CSW.world.setBounds(0, -CSW.player.yChange, CSW.configs.GAME_WIDTH, CSW.configs.GAME_HEIGHT);

  //Object trôi ra khỏi camera thì kill
  //Ngay sau khi kill sẽ khởi tạo lại object mới
  CSW.pool.forEach(function(obs){
    if(obs.position.y > CSW.camera.y + CSW.configs.GAME_HEIGHT) {
      obs.parts.forEach( function(part, index) {
        part.kill();
      });
      obs.used = false;
      obs.position.y = -99999;
      playState.reUseOne();
    };
  });
},

//Lấy random 1 object trong pool ra, nếu object đó đang được dùng thì lấy
// object đầu tiên chưa được dùng từ CSW.pool[lever - 1]
 reUseOne : function(){
  var rd = Math.floor((Math.random() * CSW.lever));
  if(CSW.pool[rd].used == false) {
    CSW.pool[rd].parts.forEach(function(part){
      part.reset(part.position.x, -CSW.player.yChange);
      part.body.angularVelocity = 2.5;
    });
    CSW.pool[rd].used = true;
    CSW.pool[rd].position.y = -CSW.player.yChange;
  }
  else {
    for (let i = CSW.lever - 1; i >= 0; i--) {
      if(CSW.pool[i].used == false) {
        CSW.pool[i].parts.forEach(function(part){
          part.reset(part.position.x, -CSW.player.yChange);
          part.body.angularVelocity = 2.5;
        });
        CSW.pool[i].used = true;
        CSW.pool[i].position.y = -CSW.player.yChange;
        break;
      }
    }
  }
},

// before camera render (mostly for debug)
 render : function(){

},

 blockHit : function (body, bodyB, shapeA, shapeB, equation) {
  //  The block hit something.
  //
  //  This callback is sent 5 arguments:
  //
  //  The Phaser.Physics.P2.Body it is in contact with. *This might be null* if the Body was created directly in the p2 world.
  //  The p2.Body this Body is in contact with.
  //  The Shape from this body that caused the contact.
  //  The Shape from the contact body.
  //  The Contact Equation data array.
  //
  //  The first argument may be null or not have a sprite property, such as when you hit the world bounds.
  if (body) {
    if (body.sprite.key==='star') {
      if(CSW.lever < CSW.pool.length){
        CSW.lever ++;
        console.log("lever hiện tại: "+CSW.lever);
      }
      body.sprite.kill(); // Recycle object here
    }
    else if (body.sprite.key==='switch') {
      body.sprite.kill(); // Recycle object here
      CSW.player.sprite.tint = CSW.configs.COLORS[body.sprite.color];
      CSW.player.sprite.color = body.sprite.color;
      CSW.pool.forEach(function(obstacle) {
        obstacle.update();
      });
    }
    else {
      this.lose();
    }
    result = 'You last hit: ' + body.sprite.key;
  }
  else {
    result = 'You last hit: The wall :)';
    this.lose();
  }
  //console.log(result);
},


 lose : function() {
  console.log("You lose");
}

}
