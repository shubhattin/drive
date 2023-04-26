#!/usr/bin/env python3

import shubhlipi as sh

for x in sh.argv:
    if x == "push":
        sh.cmd("cd api && python3 karah.py requirements.txt", direct=False)
        if "nobuild" not in sh.argv:
            sh.cmd("cd api && pipenv run python3 karah.py build", direct=False)
        sh.cmd("space push", direct=False)
