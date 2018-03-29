#!/bin/bash
cd "$( dirname "$0" )"
java -jar ../target/MagicMeta-1.0-SNAPSHOT.jar ../src/web/meta.json --regenerate