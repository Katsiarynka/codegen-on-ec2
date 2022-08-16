PROJECT_FOLDER = 'codegen'

.PHONY: init test help

help:
	@echo "init - Setup the repository"
	@echo "clean - clean all compiled python files, build artifacts and virtual envs. Run \`make init\` anew afterwards."
	@echo "test - run unit tests"
	@echo "build - create the application artefact to be deployed to Spark cluster"
	@echo "format - auto format"
	@echo "help - this command"


init:
	cd ${PROJECT_FOLDER}
	python3 -m venv .venv
	./.venv/bin/python -m pip install --upgrade pip
	poetry install
	cd ..

test:
	cd ${PROJECT_FOLDER}
	poetry run pytest -vv tests \
		--cov=${PROJECT_FOLDER} \
		--cov-config=.coveragerc \
		--cov-fail-under=100 \
		--cov-report term-missing
	cd ..

.PHONY: lint
lint:
	cd ${PROJECT_FOLDER}
	poetry run black --check .
	poetry run flake8 .
	poetry run isort --check .
	poetry run mypy ${PROJECT_FOLDER} --disallow-untyped-defs

format:
	poetry run black .
	poetry run isort .


.PHONY: build
build:
	cd infrastructure
	cdk deploy --profile=Kate
	cd ..

.PHONY: diff-infra
diff-infra:
	cd infrastructure
	cdk diff --profile=Kate
	cd ..
