<?php
require_once('../config.inc.php');
require_once('common/user.inc.php');
if (!$sandboxServer) die('No sandbox server defined');

$user = getUser();

?>

<html>
<head>
    <title><?= $title ?> Editor</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
    <link rel="stylesheet" href="common/css/common.css" />
    <link rel="stylesheet" href="common/css/loading.css" />
    <link rel="stylesheet" href="common/css/user.css"/>
    <link rel="stylesheet" href="css/codemirror.css"/>
    <link rel="stylesheet" href="css/show-hint.css"/>
    <link rel="stylesheet" href="css/ui.fancytree.css"/>
    <link rel="stylesheet" href="css/editor.css"/>

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="common/js/user.js"></script>
    <script src="js/codemirror.js"></script>
    <script src="js/show-hint.js"></script>
    <script src="js/spell-hint.js"></script>
    <script src="js/js-yaml.min.js"></script>
    <script src="js/yaml.js"></script>
    <script src="js/editor.js"></script>
    <script src="js/codeeditor.js"></script>
    <script src="js/main.js"></script>
    <script type="text/javascript">
        var user = <?= json_encode($user) ?>;
        var referenceURL = '//<?= $referenceURL ?>';
    </script>
    <?php if ($analytics) echo $analytics; ?>
</head>
<body>
<div id="container">
    <div id="header">
        <span id="saveButtonContainer">
            <button type="button" id="saveButton" title="Save your spell and reload the sandbox server configs">Save</button>
        </span>
        <span>
            <button type="button" id="loadButton" title="Load a saved spell, or one of the survival defaults">Load</button>
        </span>
        <span>
            <button type="button" id="forkButton" title="Make a copy of your current spell with a unique key name">Fork</button>
        </span>
        <span class="controlgroup">
            <button type="button" id="newButton" title="Clear your spell and start fresh">New</button>
            <select id="newSelector">
                <option value="Blank">Blank</option>
                <option value="Basic">Basic</option>
                <option value="AOE">Area of Effect</option>
                <option value="Projectile">Projectile</option>
                <option value="Sphere">Build Sphere</option>
                <option value="Break">Break Block</option>
                <option value="Repeating">Repeating Effect</option>
            </select>
        </span>
        <span id="downloadButtonContainer">
            <button type="button" id="downloadButton" title="Download this spell config. Place in plugins/Magic/spells to load it on your server.">Download</button>
        </span>
        <span id="referenceButtonContainer">
            <button type="button" id="referenceButton" title="Open the reference guide in a new window">Reference</button>
        </span>
        <span>
            <button type="button" id="validateButton" title="Check your spell configuration for syntax errors">Check</button>
        </span>
        <span id="validationIcon"></span>
        <span id="validationContainer">
            <span id="validation"></span>
        </span>
        <?php include "common/userinfo.inc.php" ?>
    </div>

    <div id="codeEditor">
        <textarea id="editor"></textarea>
    </div>
</div>

<?php include 'common/register.inc.php' ?>

<div id="loadSpellDialog" title="Load Spell" style="display:none">
    <table id="loadSpellsTable">
        <colgroup>
            <col><col><col><col style="width: 100%">
        </colgroup>
        <tbody id="loadSpellList">

        </tbody>
    </table>
</div>

<div id="defaultTemplates" style="display: none">
    <textarea id="templateBlank"></textarea>
    <textarea id="templateBasic"># This is the key name of this spell
# It must be unique across the server, and is used in commands such as /mage, /wand and /mgive
# to refer to this spell.
myspell:
  # Name and description may be added here and will appear in lore for this spell.
  name: My New Spell
  description: Damage Your Target
  # Choose an icon, used when showing this spell in a wand inventory.
  icon: stick
  # Actions define what this spell does when cast. In this case we will damage the target.
  actions:
    # Actions can be triggered from a few different events, but the most common is "cast",
    # which will happen immediately when the spell is cast.
    cast:
    - class: Damage
  # Effects are particle or sound effects that are shown when the spell is cast.
  effects:
    cast:
    - location: target
      effectlib:
        class: Sphere
    - sound: magic.zap
  # Parameters change how a spell behaves, these may be base spell parameters or
  # specific to the set of actions you are using.
  parameters:
    range: 32
    damage: 10
    </textarea>
</div>
    <textarea id="templateProjectile">myprojectile:
  name: My Projectile
  description: Damage Your Target
  icon: stick
  actions:
    cast:
    # Some actions may be chained together.
    # In this case, the CustomProjectile action launches a projectile, and when it hits
    # it will run the actions in its "actions" list.
    - class: CustomProjectile
      actions:
      - class: Damage
  effects:
    cast:
    - sound: magic.zap
    # These effects will play when the projectile hits, which will happen some time
    # after casting, as determined by the "velocity" parameter.
    hit:
    - location: target
      effectlib:
        class: Sphere
    # These effects will play each tick as the projectile travels. This can be used
    # to make your projectile visible.
    tick:
    - location: target
      particle: redstone
  parameters:
    range: 32
    velocity: 20
    damage: 10
    </textarea>
    <textarea id="templateAOE">myareaofeffect:
  name: My AOE
  description: Levitate Everything Around You
  icon: stick
  actions:
    cast:
    # Some actions may be chained together.
    # In this case, the AreaOfEffect action search for entities within a certain radius,
    # and then it will run the actions in its "actions" list on each of those entities.
    - class: AreaOfEffect
      actions:
      - class: PotionEffect
  effects:
    cast:
    - sound: magic.zap
    - location: targets
      effectlib:
        class: AnimatedBall
  parameters:
    target: self
    radius: 8
    add_effects:
      levitation: 2
    </textarea>
    <textarea id="templateSphere">mysphere:
  name: My Sphere
  description: Make a temporary sphere of blocks
  icon: slime_ball
  actions:
    cast:
    # Some actions may be chained together.
    # In this case, the Sphere action selects blocks within a Spehere
    # and then it will run the actions in its "actions" list on each of those blocks.
    #
    # Actions that call other actions like this are called "compound" actions.
    # They are generally separated into two categories: those that target blocks, and
    # those that target entities.
    # It only makes sense to use the right type of action with the right type of compound action,
    # using a Damage or PotionEffect action inside a Sphere would do nothing.
    - class: Sphere
      actions:
      # The ModifyBlock action is the most common action to use within a block-based compound action.
      - class: ModifyBlock
  effects:
    cast:
    - sound: magic.zap
    - location: target
      effectlib:
        class: Sphere
        # Variables can be used in effect parameters.
        # They will refer to spell parameters in the main "parameters" section (see below)
        # This keeps effects in sync with spell behaviors, for instance this
        # Sphere effect will always match up to the Sphere action radius
        radius: $radius
        # Likewise, this effect will only last until the Sphere disappears.
        duration: $undo
  parameters:
    # This will make the spell ignore entities and only target blocks
    target: block
    range: 16
    # This makes the spell cast even if it misses, that is does not hit a block
    # this allows for the creation of a sphere in mid-air
    allow_max_range: true
    radius: 3
    # A "brush" in Magic is a material or other special tool used for modifying blocks
    # in this case we are simply using glass.
    brush: glass
    # Spells won't modify air by default, here we allow this spell to only modify air so it won't break anything.
    modifiable: air
    # Almost everything in Magic is undoable. We don't want our world filled with
    # random spheres, so we will make this one last only 10 seconds.
    undo: 10000
    # Spell can be given cooldowns, so they can't be spam-cast.
    # This spell is limited to every 15 seconds, allowing it to undo
    # before it can be cast again.
    cooldown: 15000
    </textarea>
    <textarea id="templateBreak">mybreak:
  name: My Break
  description: Break a Block
  icon: sulphur
  actions:
    cast:
    # The BreakBlock action can be used to slowly break blocks, using packet effects
    # to mimic vanilla block breaking.
    - class: BreakBlock
  effects:
    cast:
    - sound: magic.zap
    - location: target
      particle: block_crack
      # Some particles, like block_crack, require extra data like a material to work with.
      # However, in this case we will let the particle use the target block, which is the default
      # behavior if you don't specify a material. Try uncommenting the following line to see what happens.
      # material: glass

      # These parameters can be used to fill out particle effects without sending
      # additional particle packets to players.
      # This is an efficient way to give your effects more punch.
      particle_count: 30
      # The offset X/Y/Z parameters make the particles randomly spawn within a volume around the
      # target location
      particle_offset_x: 0.5
      particle_offset_y: 0.5
      particle_offset_z: 0.5

  parameters:
    # This will make the spell ignore entities and only target blocks
    target: block
    range: 16
    # This determines how much block durability to take away with each cast
    # Repeated casts will do more damage, eventually destroying the block.
    break_durability: 10
    # Only certain blocks are destructible by default. Here we make this spell
    # able to break any solid block.
    destructible: solid
    # Almost everything in Magic is undoable. We don't want our world filled with
    # random holes, so we will make this one last only 10 seconds.
    undo: 10000
    </textarea>
    <textarea id="templateRepeating">goldwalker:
  name: Goldwalker
  description: Turn everything around you to gold
  icon: gold_ingot
  actions:
    cast:
    # The repeat action repeats its contained actions
    # multiple times.
    - class: Repeat
      actions:
      # The Retarget action updates the target location
      # Otherwise each iteration of this Repeat would target
      # the same location.
      - class: Retarget
      - class: Sphere
        actions:
        - class: ModifyBlock
      # The delay action delays for some amount of time
      # before letting the spell proceed on to the next actions
      # This is often used inside of a Repeat action to make a spell
      # animate over several ticks.
      # without the Delay, the Repeat would run through its repetitions
      # immediately.
      - class: Delay
  parameters:
    target: self
    radius: 4
    brush:
    repeat: 100
    # Delaying for 500 milliseconds (1/2 a second) in between each
    # repeat, meaning this runs twice a second.
    delay: 500
    # Here we use a "negated" material set. The ! character at the start
    # means "not", so this will modify anything that's not transparent.
    # This prevents tall grass and other passthrough blocks from turning
    # to gold.
    # We would still like to be able to walk on lava and water, though,
    # so we add those to the list.
    modifiable: "all_water,all_lava,!transparent"
    # This parameter doesn't affect the spell behavior at all, but will
    # advertise that this spell lasts for 50 seconds, which is
    # delay x repeat.
    total_duration: 50000
    undo: 10000
    # The undo_speed parameter can be used to make undo animated.
    # This will undo 20 blocks per second, rather than undoing all at once.
    undo_speed: 20
    cooldown: 2000
    </textarea>
</div>

</body>
</html>
