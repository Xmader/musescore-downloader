#!/bin/bash

#* STEP 0
sudo npm i -g prettier
I18N_PATH="./src/i18n"

#* STEP 1
shopt -s nullglob

#* STEP 3
import_first_line=$(awk '/'"import i18n from"'/,/'"function getLocale"'/ {printf NR "\n"}' src/i18n/index.ts | head -n 1)
import_last_line=$(awk '/'"import i18n from"'/,/'"function getLocale"'/ {printf NR "\n"}' src/i18n/index.ts | tail -n 3 | head -n 1)
sed -i "${import_first_line},${import_last_line}d" src/i18n/index.ts
sed -i "${import_first_line}i import i18n from "'"'"i18next"'"'";" src/i18n/index.ts

map_first_line=$(awk '/'"languageMap = \["'/,/'"\];"'/ {printf NR "\n"}' src/i18n/index.ts | head -n 1)
map_last_line=$(awk '/'"languageMap = \["'/,/'"\];"'/ {printf NR "\n"}' src/i18n/index.ts | tail -n 1 | head -n 1)
sed -i "${map_first_line},${map_last_line}d" src/i18n/index.ts
sed -i "${map_first_line}i let languageMap = [" src/i18n/index.ts

resources_first_line=$(awk '/'"resources: \{"'/,/'"  \},"'/ {printf NR "\n"}' src/i18n/index.ts | head -n 1)
resources_last_line=$(awk '/'"resources: \{"'/,/'"  \},"'/ {printf NR "\n"}' src/i18n/index.ts | tail -n 1 | head -n 1)
sed -i "${resources_first_line},${resources_last_line}d" src/i18n/index.ts
sed -i "${resources_first_line}i resources: {" src/i18n/index.ts

for file in $I18N_PATH/*.json; do
    filename=${file##*/}
    filename=${filename%%\.*}
    unsanitized_filename=${filename//-/$'_'}
    sed -i "${import_first_line}s"'/$/'"import $unsanitized_filename from "'"'".\/$filename.json"'"'";"'/' src/i18n/index.ts
    sed -i "${map_first_line}s"'/$/"'"$filename"'",/' src/i18n/index.ts
    sed -i "${resources_first_line}s"'/$/'""'"'"$filename"'"'": { translation: $unsanitized_filename },"'/' src/i18n/index.ts
done
sed -i "${map_first_line}s"'/$/'"];"'/' src/i18n/index.ts
sed -i "${resources_first_line}s"'/$/'"},"'/' src/i18n/index.ts

#* STEP 4
prettier --write ./src/i18n/index.ts

shopt -u nullglob

exit 0
