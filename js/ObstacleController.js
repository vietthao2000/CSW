class ObstacleController{
	constructor(spriteName,configs,angle,position) {
		this.sprite = CSW.obstacleGroup.create(position.x,position.y,spriteName);
		this.configs = configs;
		this.sprite.anchor = new Phaser.Point(this.configs.anchor.x,this.configs.anchor.y);
		this.sprite.body.angularVelocity = 100;
		this.sprite.scale.setTo(this.configs.ratio,this.configs.ratio);
		this.sprite.angle = angle;
	}
}