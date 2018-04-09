<?php
?>

<div id="registrationDialog" title="Log In" style="display: none">
    <div id="registrationTitle">Please log into the <span class="server"><?= $sandboxServerURL ?></span> server and register</div>
    <div>
        <label for="userId">In-Game Name:</label><input type="text" id="userId">
    </div>
</div>

<div id="codeDialog" title="Enter Code" style="display:none">
  <div style="margin-bottom: 0.5em">
    <span style="float:left; margin:0 7px 7px 0;">
        <img src="http://i.stack.imgur.com/FhHRx.gif" alt="Waiting.."/>
    </span>
      <span>Please enter the code in-game at</span>
  </div>
  <div>
      <span class="server"><?= $sandboxServerURL ?></span>
  </div>
  <div class="code">
    /magic register <span id="codeDiv"></span>
  </div>
</div>
