#!/bin/bash
# Java 21 Environment Setup for Business Portfolio Project
export JAVA_HOME=/usr/local/Cellar/openjdk@21/21.0.8/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
echo "✅ Java 21 environment configured for Business Portfolio project"
echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "Maven version: $(mvn -version 2>&1 | head -n 1)"
