RS Chef'z — the offline copy
============================

Open  index.html  by double-clicking it. That is the whole thing. No
server, no install, no address to type. Works from a USB stick, from
Downloads, from anywhere.


WHAT WORKS
----------

  * The whole site, designed, on all three pages
  * The hero film, playing
  * The drifting headline type and every scroll animation
  * All product photography and pack artwork
  * Both product pages, and the links between them
  * Phone, tablet and desktop layouts (resize the window, or press F12
    and use the device toolbar)


WHAT IS DIFFERENT, AND WHY
--------------------------

The 3D world is replaced by the flat version of itself — the same warm
space and the same colours, drawn in CSS instead of WebGL.

This is not a setting that can be turned back on. A browser treats every
file opened from a disk as belonging to its own separate origin, and
WebGL refuses to use a picture from a different origin as a texture:

    SecurityError: Failed to execute 'texImage2D' ...
    The image element contains cross-origin data, and may not be loaded.

The packs in the 3D world are textures — the artwork is painted onto the
models — so the first one loaded triggers that and there is no way around
it from inside the page. It is a browser security rule, the same one in
Chrome, Edge, Firefox and Safari.

The site already knows how to draw itself without WebGL, because some
visitors have old machines or ask for reduced motion, so it simply uses
that version here.

To see the real 3D world on this computer, use the other folder — the
Hostinger one — and double-click its preview launcher. That runs a tiny
web server for a second, which is all WebGL needs to treat the artwork as
same-origin. It is still one double-click.

And of course the live site at rschefz.com has the full 3D.


DO NOT UPLOAD THIS FOLDER
-------------------------

This copy is for looking at on a computer, not for hosting. Two things
were changed to make it open from a disk, and both are wrong for a real
website:

  * Links point at .html files rather than at clean addresses, so
    rschefz.com/products/gobi-manchurian-masala would stop working.
  * The product pages were moved out of the products folder.

Upload the OTHER download — the Hostinger one, with the .htaccess in it.


IF THE PAGE LOOKS PLAIN
-----------------------

Make sure the whole folder was extracted, not just index.html. index.html
needs the _next and assets folders sitting next to it. Dragging a single
file out of a ZIP leaves those behind.
