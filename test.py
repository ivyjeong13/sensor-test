import schedule
import time
import sys
from random import randint

amps = 20
iterations = 2
counter = 0

def simp():
	global amps
	global iterations
	global counter
	now = time.time() * 1000

	print(str(amps) + ',' + str(now))
	if counter == iterations:
		choice = randint(0,1)
		counter = 0
		if choice == 1 or (choice == 0 and amps <= 5):
			amps = amps + 5
		elif choice == 0 or (choice == 1 and amps >= 70): 
			amps = amps - 5
	counter = counter + 1

	sys.stdout.flush()

schedule.every(5).seconds.do(simp)

while 1:
	schedule.run_pending()
	time.sleep(1)
