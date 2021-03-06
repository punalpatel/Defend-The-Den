(function() {
    DTD.skillList = [];
    DTD.skillList["ThrowingAxe"] = {
        name : "Throwing Axe",
        key : 1,
        stats : [{
            damageMin : 10,
            damageMax : 20,
            coolDown : 1.250,
            goldCost : 0
        }, {
            damageMin : 14,
            damageMax : 24,
            coolDown : 1.0,
            goldCost : 5
        }, {
            damageMin : 18,
            damageMax : 28,
            coolDown : 0.725,
            goldCost : 15
        }]
    };
    DTD.skillList["DTD.ThrowingRock"] = {
        name : "Throwing Brick",
        key : 3,
        stats : [{
            damageMin : 9,
            damageMax : 19,
            coolDown : 5,
            energyCost : 1,
            goldCost : 0
        }, {
            damageMin : 13,
            damageMax : 23,
            coolDown : 4.5,
            energyCost : 1,
            goldCost : 10
        }, {
            damageMin : 17,
            damageMax : 27,
            coolDown : 3,
            energyCost : 1,
            goldCost : 15
        }]
    };
    DTD.skillList["Blow"] = {
        name : "Blow",
        key : 2,
        stats : [{
            coolDown : 12,
            energyCost : 1,
            goldCost : 0
        }, {
            coolDown : 10,
            energyCost : 1,
            goldCost : 10
        }, {
            coolDown : 8,
            energyCost : 1,
            goldCost : 15
        }]
    };

    DTD.throwingAxeSkill = function() {
        var skillLevel = (DTD.gameType == "endless") ? 2 : storage.axeSkill.get();
        return new SkillButton(1, "ThrowingAxe", {
            cooldown : DTD.skillList["ThrowingAxe"].stats[skillLevel].coolDown,
            action : function() {
                DTD.player._spriteComponent.stop().animate("throwAxe", 18, 0);
                setTimeout(function() {
                    if(DTD.inGame) {
                        DTD.throwAxe();
                    }
                }, 20 * 20 * 0.5);
                setTimeout(function() {
                    if(DTD.inGame) {
                        DTD.player._spriteComponent.stop().animate("walkWolf", 18, 0);
                    }
                }, 20 * 20 * 1.5);
            }
        });
    };
    
    DTD.blowSkill = function() {
        var skillLevel = (DTD.gameType == "endless") ? 2 : storage.blowSkill.get();
        return new SkillButton(2, "Breath", {
            sprite : "windSkill",
            keyBind : 2,
            cooldown : DTD.skillList["Blow"].stats[skillLevel].coolDown,
            action : function() {
                DTD.player._spriteComponent.stop().animate("blow", 18, 0);
                setTimeout(function() {
                    if(DTD.inGame) {
                        DTD.blow();
                    }
                }, 20 * 20 * 0.01);
                setTimeout(function() {
                    if(DTD.inGame) {
                        DTD.player._spriteComponent.stop().animate("walkWolf", 18, 0);
                    }
                }, 20 * 20 * 1.5);
            },
            energyCost : DTD.skillList["Blow"].stats[skillLevel].energyCost
        });
    };
    
    DTD.rockSkill = function() {
        var skillLevel = (DTD.gameType == "endless") ? 2 : storage.rockSkill.get();
        return new SkillButton(3, "Rock", {
            sprite : "rockSkill",
            keyBind : 3,
            cooldown : DTD.skillList["DTD.ThrowingRock"].stats[skillLevel].coolDown,
            action : function() {
                if(DTD.inGame) {
                    DTD.rock();
                }
            },
            energyCost : DTD.skillList["DTD.ThrowingRock"].stats[skillLevel].energyCost
        });
    };
    
    DTD.throwAxe = function() {
        Crafty.audio.play("throwAxe");
        storage.axeThrowed.set(storage.axeThrowed.get() + 1);
        Crafty.e("ThrowingAxe").attr({
            x : DTD.player.x,
            y : DTD.player.y - 10
        });
    }

    DTD.blow = function() {
        storage.blows.set(storage.blows.get() + 1);
        if(DTD.player._actualEnergy >= DTD.skillList["Blow"].stats[storage.axeSkill.get()].energyCost) {
            DTD.player.consumeEnergy("blow");
            Crafty.e("Blow").attr({
                x : DTD.player.x,
                y : DTD.player.y - 35
            });
        }
    }

    DTD.rock = function() {
        Crafty.audio.play("throwAxe");
        storage.rocks.set(storage.rocks.get() + 1);
        if(DTD.player._actualEnergy >= DTD.skillList["DTD.ThrowingRock"].stats[storage.axeSkill.get()].energyCost) {
            DTD.player.consumeEnergy("rock");
            Crafty.e("Rock").attr({
                x : DTD.player.x,
                y : DTD.player.y - 40
            });
        }
    }


    Crafty.c("SkillButton", {
        init : function() {
            this.addComponent("2D, Canvas, Mouse, KeyBoard, Sprite, skill");
            this.attr({
                x : 10,
                y : 520,
                w : 52,
                h : 52,
                z : 16
            });
            this._energyCost = 0;
            this.cooldown = 0.5;
            this.coolDownStart = 0;
            this.coolDownFinish = 0;
            this.cdon = false;
            this._coolDownCount = Crafty.e("2D, Canvas, skillCooldown").attr({
                x : this.x,
                y : this.y,
                w : this.w,
                h : 0,
                z : 19
            });
            this._keyPressSprite = Crafty.e("2D, Canvas, skillKeyPress").attr({
                x : this.x,
                y : this.y,
                w : this.w,
                h : 0,
                z : 17
            });
            this.bind("EnterFrame", function() {
                if(DTD.player._actualEnergy < this._energyCost) {
                    this.sprite(1, 0, 1, 1);
                } else {
                    this.sprite(0, 0, 1, 1);
                }
                if(this.cdon) {
                    var newH = (this.coolDownFinish - parseInt(new Date().getTime(), 10)) * 44 / (1000 * this.cooldown);
                    var newY = this.y + (52 - newH) / 2;
                    if(newH < 0) {
                        this.cdon = false;
                        newH = 0;
                        newY = 10;
                    }
                    this._coolDownCount.attr({
                        h : newH,
                        y : newY
                    });
                }
            });
        }
    });
    Crafty.c("ThrowingAxe", {
        init : function() {
            this._used = false;
            this.addComponent("2D, Canvas, Collision, axe");
            this.attr({
                x : 32,
                y : 32,
                w : 42,
                h : 42,
                z : 25
            });
            this.origin("center");
            this.bind("EnterFrame", function() {
                this.attr({
                    rotation : this.rotation + 19
                });
                this.move("e", 12);
            });

            this.onHit("Enemy", function(o) {
                o[0].obj.takeDamage(DTD.damagesFor("ThrowingAxe"));
                this.destroy();
            });
            this.bind("EnterFrame", function() {
                if(!DTD.isInViewPort(this)) {
                    this.destroy();
                }
            });
        }
    });

    Crafty.c("GrannyBolt", {
        init : function() {
            this._used = false;
            this.addComponent("2D, Canvas, Collision, SpriteAnimation, fireball");
            this.attr({
                x : -30,
                y : -30,
                w : 30,
                h : 30,
                z : 25
            });
            this.animate("fireball", 0, 0, 3)
            this.animate("fireball", 15, -1)
            this.origin("center");
            this.bind("EnterFrame", function() {
                this.move("w", 5.5);
            });

            this.onHit("Wolf", function(o) {
                DTD.player.takeDamage("fireBolt");
                this.destroy();
            });
            this.bind("EnterFrame", function() {
                if(!DTD.isInViewPort(this)) {
                    this.destroy();
                }
            });
        }
    });

    Crafty.c("RiddingPie", {
        init : function() {
            this._used = false;
            this.addComponent("2D, Canvas, Collision, pie");
            this.attr({
                x : 16,
                y : 16,
                w : 16,
                h : 16,
                z : 25
            });
            this._damagesBase = {
                min : 7,
                max : 12
            };
            this._damagesModifier = 1;
            this.origin("center");
            this.bind("EnterFrame", function() {
                this.attr({
                    rotation : this.rotation + 10
                });
                this.move("w", 4.5);
            });

            this.onHit("Wolf", function(o) {
                DTD.player.takeDamage("riddingPie");
                this.destroy();
            });
            this.bind("EnterFrame", function() {
                if(!DTD.isInViewPort(this)) {
                    this.destroy();
                }
            });
        }
    });

    Crafty.c("Blow", {
        init : function() {
            this._used = false;
            this.addComponent("2D, Canvas, Collision, SpriteAnimation, blow");
            this.attr({
                x : 32,
                y : 32,
                w : 70,
                h : 70,
                z : 25
            });
            this.animate("blow", 0, 0, 3);
            this.animate("blow", 65, 0);
            this._damagesModifier = 1;
            this.origin("center");
            this.bind("EnterFrame", function() {
                this.move("e", 6.5);
            });
            this.onHit("Enemy", function(o) {
                o[0].obj.bump();
            });
            this.bind("EnterFrame", function() {
                if(!DTD.isInViewPort(this)) {
                    this.destroy();
                }
            });
        }
    });

    Crafty.c("Rock", {
        init : function() {
            this._used = false;
            this._enemyHit = false;
            this._stopMove = false;
            this._enemyWounded = false;
            this.addComponent("2D, Canvas, Collision, SpriteAnimation, Delay, rock");
            this.attr({
                x : 32,
                y : 32,
                w : 140,
                h : 140,
                z : 25
            });
            this.animate("rock", 0, 0, 5);
            this.origin("center");
            this.bind("EnterFrame", function() {
                if(!this._stopMove) {
                    this.attr({
                        rotation : this.rotation + 7
                    });
                    this.move("e", 6.5);
                }
            });
            this.onHit("Enemy", function(o) {
                if(!this._enemyHit) {
                    this._enemyHit = true;
                    this.delay(function() {
                        this._stopMove = true;
                        this.animate("rock", 20, 0);
                    }, 350);
                }
                if(this._stopMove && !this._enemyWounded) {
                    this._enemyWounded = true;
                    this.delay(function() {
                        var that = this;
                        _.each(o, function(item, key) {
                            item.obj.takeDamage(DTD.damagesFor("DTD.ThrowingRock"));
                        });
                        this.destroy();
                    }, 350);
                }
            });

            this.bind("EnterFrame", function() {
                if(!DTD.isInViewPort(this)) {
                    this.destroy();
                }
            });
        }
    });

    function SkillButton(position, skillName, options) {
        this.position = position || 1;
        this.skillName = skillName || "";
        _.defaults(options, {
            sprite : "axe",
            keyBind : 1,
            cooldown : 1.5,
            action : function() {

            },
            energyCost : 0
        });
        var that = this;
        this.c = Crafty.c(that.skillName + "Skill", {
            init : function() {

                this.addComponent("SkillButton");
                this._energyCost = options.energyCost;
                this.attr({
                    x : this._x + ((this._x + this._w) * position) - this._w
                });

                this.cooldown = options.cooldown;
                this.bind('KeyUp', function(e) {
                    if(e.keyCode === Crafty.keys["" + options.keyBind + ""]) {
                        this._keyPressSprite.attr({
                            h : 0
                        });
                        this.checkAction();
                    }
                });
                this.bind('KeyDown', function(e) {
                    if(e.keyCode === Crafty.keys["" + options.keyBind + ""]) {
                        this._keyPressSprite.attr({
                            h : 54
                        });
                    }
                });

                this.bind('MouseDown', function(e) {
                    this._keyPressSprite.attr({
                        h : 54
                    });
                });
                this.bind('MouseUp', function(e) {
                    this._keyPressSprite.attr({
                        h : 0
                    });
                    this.checkAction();
                });

                this.bindVisual();

                this._coolDownCount.attr({
                    x : this._x
                });
                this._keyPressSprite.attr({
                    x : this._x
                });

                DTD.createKeyHelper(this, options.keyBind);
            },
            checkAction : function() {
                if(!this.cdon) {
                    this.action();
                    this.coolDownStart = parseInt(new Date().getTime(), 10);
                    this.coolDownFinish = parseInt(new Date().getTime() + (this.cooldown * 1000), 10);
                    this.cdon = true;
                }
            },
            action : function() {
                DTD.selectedSkill = that.skillName + "Skill";
                this.trigger("action");
                options.action();
            },
            bindVisual : function() {
                this._skillVisual = Crafty.e("2D, Canvas, " + options.sprite).attr({
                    x : this.x + 4,
                    y : this.y + 4,
                    w : 42,
                    h : 42,
                    z : 16
                });
            }
        });
        this.e = Crafty.e(this.skillName + "Skill");
    }

})();
