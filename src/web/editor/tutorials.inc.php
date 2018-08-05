<?php ?>

<div id="tutorialMask" class="mask">
&nbsp;
</div>

<div id="welcomeTutorial" class="tutorial" data-next="editorTutorial">
    <div style="font-weight: bold; padding-bottom: 1em">Welcome to the Magic spell editor!</div>
    <div>This editor will assist you in creating and editing spell configurations. If this is your first time here,
        it is strongly recommended that you follow this brief tutorial!</div>
    <div>Just click anywhere on the screen to proceed to the next slide.</div>
    <div style="padding: 0.5em"><span style="font-weight:bold">Press the escape key</span> at any point to close this tutorial.</div>
</div>

<div id="editorTutorial" class="tutorial" data-my="left top+50" data-at="left bottom" data-of="loadButton" data-next="newTutorial">
    <div>This is the main editor area. This is where you will type in your spell configurations!</div>
    <div>The editor was made specifically for spell creation, it will check for errors, highlight your spell
    code for readability, and automatically suggest new properties or values in a context-aware way.</div>
    <div>You won't have to leave this page to look up names for materials, particles or anything else you'll need to type here!</div>
    <div style="margin-top: 2em">
        The editor comes preloaded with an simple example configuration that describes the general anatomy of a spell. It is a good
        idea to read through this configuration, paying special attention to its comments, in order to understand how the spell works.
    </div>
</div>

<div id="newTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="newButton" data-next="exampleTutorial">
    <div>Use this button to clear the editor and start with a completely blank canvas.</div>
</div>

<div id="exampleTutorial" class="tutorial balloon top" data-my="left top" data-at="right-10 bottom" data-of="newButton" data-next="loadTutorial">
    <div>This drop-down contains several example spell templates you can load into the editor.</div>
    <div>It is highly recommended that you load and read through each one if you are not familiar with the basics of spell configuration!</div>
    <div>Each option represents a common use pattern found in many magic spells, though they are really only here to give you ideas. Once
    you are familiar with the basics of spell anatomy, and the spell actions available to you, the possibilities are endless!</div>
</div>

<div id="loadTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="loadButton" data-next="loginTutorial">
    <div>The Load button can be used to load any spell created by any player using this editor, including your own.</div>
    <div>All of the builtin survival spells are also available to load here. Some of them are documented with comments, but
    most of them may not be. It might take some time to fully understand how they work.
    </div>
</div>

<div id="loginTutorial" class="tutorial balloon top-right" data-my="right top" data-at="right bottom" data-of="loginButton" data-next="saveTutorial">
    <div>If you are not already logged in, there are many benefits to creating a login using this Login button!</div>
    <div>You do not have to enter any information other than your in-game name.</div>
    <div>You will then need to log into <span class="code">sandbox.elmakers.com</span> with your Minecraft client, and enter your unique code.</div>
    <div>Once you have done this, you will be able to save your spell configurations and share them with the community!</div>
    <div>But even better, in-game on the sandbox server you will be given a wand containing all of the spells you have made
    and saved in this editor. Your changes here will show up immediately in-game, allowing for rapid prototyping, testing and debugging
    of your new spell configs.</div>
    <div>Once you log in, you will stay logged in and will not be shown this tutorial again.</div>
</div>

<div id="saveTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="saveButton" data-next="forkTutorial">
    <div>When you have something you want to try out, you can use the Save button.</div>
    <div>Saving a spell will keep it for later, and also share it with the community! Anyone will be able to load your spell, try it out,
        and make copies of it to modify or improve it.
    </div>
    <div>Saving a spell will also add it onto your Sandbox Wand in-game on the sandbox server so you can try it out live. Each time you
    click the Save button, your spell configs on the sandbox server will reload so you can easily test out changes.</div>
</div>

<div id="forkTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="forkButton" data-next="deleteTutorial">
    <div>If you find a config you like using the Load button, you may want to try it out in-game or modify it.</div>
    <div>Since every spell in the game needs to have a unique name, you won't be able to save someone else's spell directly. You don't
        want to overwrite their creation!
    </div>
    <div>So instead you need to rename it to something unique. If you're at a creative loss for a new name, simply hit the Fork
    button and a new unique name will be created for you.</div>
</div>

<div id="deleteTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="deleteButton" data-next="downloadTutorial">
    <div>If, for some reason, you've made a mistake saving a spell and you really want it gone, use the Delete button.</div>
    <div>This will delete the spell you currently have loaded in the editor.</div>
    <div>Just remember- forever is a long time!</div>
</div>

<div id="downloadTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="downloadButton" data-next="referenceTutorial">
    <div>Once you have a spell you're happy with and you'd like to use it on your own server, click the Download button to download the spell config.</div>
    <div>Then just drop that file into the <span class="code">plugins/Magic/spells</span> folder on your server, use <span class="code">/magic load</span> and your
    spell will be available!</div>
    <div>For players to use it, you will need to add it to a path config or a shop, or provide some other way for it to be obtainable.</div>
</div>

<div id="referenceTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="referenceButton" data-next="tutorialTutorial">
    <div>For detailed information on all spell actions, effect classes and just about everything else in Magic, click the Reference button to open the reference guide.</div>
</div>

<div id="tutorialTutorial" class="tutorial balloon top" data-my="left top" data-at="left bottom" data-of="helpButton" data-next="finishedTutorial">
    <div>
        This tutorial is a work in progress, click this button if you ever wish to see it again.
    </div>
</div>

<div id="finishedTutorial" class="tutorial">
    <div>Thank you for reading through the tutorial!</div>
    <div>Best of luck with your new creations! If you invent something amazing please share it with the community on the
    <a href="https://www.spigotmc.org/threads/magic.28645/" target="_blank">SpigotMC Discussion Board</a> or in <a href="https://discord.gg/6FPWAE" target="_blank">the Magic discord channel<a/>.</div>
</div>