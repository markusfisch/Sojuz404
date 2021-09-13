#!/usr/bin/env bash
while read -r
do
	# embed referenced scripts
	[[ $REPLY == *\<script\ src=* ]] && {
		SRC=${REPLY#*src=\"}
		SRC=${SRC%%\"*}
		[ -r "$SRC" ] && {
			echo -n '<script>'
			esbuild --minify "$SRC"
			echo -n '</script>'
			continue
		}
	}
	# remove comments
	REPLY=${REPLY%%//*}
	# remove indent
	REPLY=${REPLY##*$'\t'}
	# remove empty lines
	[ "$REPLY" ] || continue
	# remove optional blanks
	echo -n "$REPLY" | sed '
s/\([ML]\) /\1/g;
s/ {/{/g;
s/, /,/g;
s/: /:/g;
s/; /;/g;
s/;"/"/g;'
done | sed '
s/><\/circle>/\/>/g;
s/><\/ellipse>/\/>/g;
s/><\/line>/\/>/g;
s/><\/path>/\/>/g;
s/><\/polygon>/\/>/g;
s/><\/polyline>/\/>/g;
s/><\/rect>/\/>/g'
