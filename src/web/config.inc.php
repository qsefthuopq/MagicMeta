<?php 

// Magic configuration file path
// You can set up a symlink for this, or handle it however you like
$magicRootFolder = dirname(__FILE__) . '/../main/resources';

// This is for the live editor, if you have a sandbox server set up the file path here.
// The webserver will need write access to $sandboxServer/plugins/Magic/data/updated.yml
// and read access to $sandboxServer/plugins/Magic/data/registered.yml
$sandboxServer = '/home/minecraft/servers/sandbox';
// And set the URL to your sandbox server here to direct players to log in
$sandboxServerURL = '';

// Use your own reference URL here if you want
$referenceURL = 'reference.elmakers.com';

// Set this if you want logins to work across multiple subdomains
$primaryDomain = '';

// This is mainly used in testing, normally doesn't need to be changed
$magicDefaultsFolder = $magicRootFolder . '/defaults';

// Resource Pack folder
$resourcePackFolder = $magicRootFolder . '/../resource-pack';

// Configure InfoBook integration (external plugin)
$infoBookRootConfig = dirname(__FILE__) . '/../main/resources/examples/InfoBook/config.yml';

// Page title
$title = "魔法插件开发服务器";

// Instructional YouTube video id
$youTubeVideo = '8rjY8pjjPM8';

// How players get wands, other than view the configured ways in magic.yml (crafting, random chests)
$howToGetWands = array('你可以在Essentials的商店内购买法杖', '你也可以使用dynmap找到地面上的法杖');

// Page overview - this will get put in a Header at the top of the page.
$pageOverview = <<<EOT
	<div style="margin-left: 128px;">
		欢迎来到elMakers的魔法插件开发服务器!<br/><br/>
		这是款服务器插件 <a href="http://www.bukkit.org" target="_new">Bukkit</a> minecraft server.
		更多信息,请 <a href="http://dev.bukkit.org/bukkit-plugins/magic/" target="_new">点击这里.</a>
		<br/><br/>
		因为这只是个开发服务器, 所以你可以自由登录并游玩该服务器，IP为
		<span class="minecraftServer">mine.elmakers.com</span>.（需要正版账号） 你也可以在这里查看我们的 <a href="http://mine.elmakers.com:8080"/>卫星地图</a>, 这个世界有点乱.
		<br/><br/>
		感谢观看!
	</div>
EOT;

$analytics = <<<EOT
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-17131761-5', 'elmakers.com');
  ga('send', 'pageview');

</script>
EOT;

?>
