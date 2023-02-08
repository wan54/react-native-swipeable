BIN = ./node_modules/.bin
SRC = $(shell find ./src -name '*.ts')
EXAMPLE = $(shell find ./example/*.ts)

lint::
	@$(BIN)/eslint $(SRC) $(EXAMPLE)

release-patch: build lint
	@$(call release,patch)

release-minor: build lint
	@$(call release,minor)

release-major: build lint
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

build:
	@echo "building..."
	@$(BIN)/tsc src/index.tsx --target es5 --outDir lib --skipLibCheck --jsx react-native --esModuleInterop --declaration $<

clean:
	@rm -rf lib/

define release
	npm version $(1)
endef
