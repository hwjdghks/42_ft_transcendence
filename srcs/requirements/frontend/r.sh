#!/bin/bash

output_file="output.txt"

# 파일을 새로 쓸 준비(기존 내용 초기화)
> "$output_file"

# ls -R 결과를 먼저 출력(백틱으로 감싸기)
{
  echo '```'
  ls -R
  echo '```'
  echo
} >> "$output_file"

# find를 사용해 node_modules/.git 폴더는 제외, PNG 파일 제외, output.txt 자신 제외
find . \
  \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
  -type f \
  ! -path "./$output_file" \
  ! -iname '*.png' \
  ! -iname '*.jpg' \
  -print | while read -r file; do
    
    echo '```' >> "$output_file"
    echo "$file" >> "$output_file"
    echo >> "$output_file"
    cat "$file" >> "$output_file"
    echo >> "$output_file"
    echo '```' >> "$output_file"
    echo >> "$output_file"
done

echo "모든 파일 내용을 '$output_file'에 저장 완료(단, PNG 파일 제외)."
