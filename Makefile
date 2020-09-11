BUILD = htdocs/index.html
ARCHIVE = archive.zip

$(ARCHIVE): $(BUILD)
	zip $@ $^
	@echo "$$((10000000 / 13312 * $$(stat -f '%z' $@) / 100000))%" \
		"($$(stat -f '%z' $@) bytes)"

$(BUILD): src/src.js src/preview.html
	cd src && bash ../bin/squeeze.sh < preview.html > ../$@

clean:
	rm -f $(BUILD) $(ARCHIVE)

up: $(BUILD)
	scp $(BUILD) hhsw.de@ssh.strato.de:sites/js13k2020/
