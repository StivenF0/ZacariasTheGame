/** /*:
 * @author William Ramsey
 * @plugindesc Water Reflection plugin
 *  
 * @help
 * This creates a water-reflect effect on the same layer as the parallax.
 * While it doesn't affect the parallax image, it appears above it.
 * 
 * PATCH 1.03
 * 
 * Patch provides a fix for balloon icons
 * 
 * 
 * EDIT YOUR WATER
 * You'll need to edit your water tiles to have transparancy.
 * Semi or full, either will work. Preffered a solid color for
 * your parallax background. Bascially, anything that shows the
 * parallax will show reflections as well.
 * 
 * SPRITES ONLY
 * Sprites are the only thing being reflected. If you want to
 * reflect something like a tree, consider making the tree an event.
 * 
 * DISABLE REFLECTION
 * To disable reflection, you can include <disableReflect> inside
 * your maps tag. This will disable the reflection effect.
 */

(() => {
    if (!proSnapCoreInstalled) return;

    /**
     * Hijack the old spriteset creation process
     * to include Sprite cloning */
    const proOldPar = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function() {

        proOldPar.apply(this, arguments);
        this._proReflectSprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
        this._proReflectSprite.y = 0;
        if (proSnapQuality === true) {
            this.proReflectFilter = new PIXI.filters.ReflectionFilter({
                mirror: false,
                boundary: 0,
                amplitude: [4, 4],
                waveLength: [6, 6]
            });
            this.proBlurFilter = new PIXI.filters.BlurFilter(0.5);

            this._proReflectSprite.filters = [this.proReflectFilter, this.proBlurFilter];
            this._proReflectSprite.z = 999;
        }

    };

    const proCreateChars = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function() {
        proCreateChars.apply(this, arguments);
        this._reflectSprites = [];
        $gameMap.events().forEach(function(event) {
            this._reflectSprites.push(new Sprite_Character(event));
        }, this);
        $gameMap.vehicles().forEach(function(vehicle) {
            this._reflectSprites.push(new Sprite_Character(vehicle));
        }, this);
        $gamePlayer.followers().reverseEach(function(follower) {
            this._reflectSprites.push(new Sprite_Character(follower));
        }, this);
        this._reflectSprites.push(new Sprite_Character($gamePlayer));
        for (var i = 0; i < this._reflectSprites.length; i++) {
            if (!$dataMap.meta.disableReflect) {
                this._proReflectSprite.addChild(this._reflectSprites[i]);
                this._reflectSprites[i].transform.scale._y = -0.5;
                this._reflectSprites[i].transform.scale._x = 0.9;
            }
        }
        this._parallax.addChild(this._proReflectSprite);
    };


    const oldUpd = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        oldUpd.apply(this, arguments);
        if (proSnapQuality === true) {
            this.proReflectFilter.time += 0.1;
        }
    }

    Sprite_Character.prototype.startBalloon = function() {
        if (!this._balloonSprite) {
            this._balloonSprite = new Sprite_Balloon();
        }
        this._balloonSprite.setup(this._character.balloonId());
        SceneManager._scene.children[0].addChild(this._balloonSprite);
    };
    Sprite_Character.prototype.endBalloon = function() {
        if (this._balloonSprite) {
            SceneManager._scene.children[0].removeChild(this._balloonSprite);
            this._balloonSprite = null;
        }
    };
})();