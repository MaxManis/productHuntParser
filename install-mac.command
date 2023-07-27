#!/bin/bash

if [ "$1" ]; then
  echo "Path to file found";
  targetPath="$1";
  echo "Installing...";
fi

if [ ! "$targetPath" ]; then
  echo "Path not found...";
  exit 0;
fi

sleep 3;

chmod 755 $0
chmod 755 $targetPath

if [ "$1" ]; then
  echo "Installed!";
  echo "Now you can execute the $1 file!";
fi

