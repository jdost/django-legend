#!/bin/sh

REQ=$(dirname $0)/req

cd $1
source bin/activate
pip install -r $REQ
deactivate
