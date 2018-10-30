from os import system as s
from sys import argv


if len(argv) == 1 and False:
	s('FLASK_APP=server.py flask run --port 80')
if len(argv) == 1:
	s('FLASK_APP=server.py flask run --host 200.239.132.124 --port 4000')
#	s('FLASK_APP=server.py flask run --host 192.168.1.6 --port 80')
else:
	s('FLASK_APP=server.py flask run --port ' + argv[1])