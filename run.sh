#!/bin/bash
cd ..
git clone https://github.com/falcon-hackathon-enigma/BFF.git
echo "Succesfully cloned BFF"
git https://github.com/falcon-hackathon-enigma/RAG.git
echo "Succesfully cloned RAG"

cd UI
docker-compose build
docker-compose up -d
