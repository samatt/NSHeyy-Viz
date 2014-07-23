# -- coding: utf-8 --
# import requests

from datetime import datetime, date, time, timedelta
from couchdbkit import *
import sys
import os
import time
 
import random
# idMap =  dict()
routerMap = dict()
clientMap = dict()

def randomMAC():
    mac = [ 0x00, 0x16, 0x3e,
        random.randint(0x00, 0x7f),
        random.randint(0x00, 0xff),
        random.randint(0x00, 0xff) ]
    return ':'.join(map(lambda x: "%02x" % x, mac))

class Node(Document):
    kind = StringProperty()
    bssid = StringProperty()
    essid = StringProperty()
    ap_essid = StringProperty()
    created_at =DateTimeProperty()
    power = IntegerProperty()
    probes = ListProperty(StringProperty())
    #first time seen
    first = DateTimeProperty()
    #last time seen
    last = DateTimeProperty()    

def readFile(fileName):
    isRouter = None
    for line in fileName:

        line.strip()
        line = line.replace("\r\n"," ")
        params = line.split(',')

        if len(params) <7 :
            # print params
            logging.error("Invalid Packet. Too small")
            continue
        
        ID = params[0].strip()

        if ID == "BSSID":
            isRouter = True
            continue
        if ID == "Station MAC":
            isRouter = False
            continue
        # logging.debug( ("Router" if isRouter else "Client") + " with params len : "+ str(len(params)))
        if isRouter:
            if len(params) < 15:
                print 'Router packet size is invalid'
                continue

            if ID in routerMap.keys():
                cur = db.get(routerMap[ID])

                if hasTimeChanged(cur['last'],params[2].strip()):
                    updateRouter(cur,params)
                else:
                    print 'router exists not updating'
            else:
                print 'adding new router'
                print ID
                print routerMap.keys()
                addRouter(params)
        else:
            if len(params) < 7:
                print 'Client packet size is invalid'
                continue

            if ID in clientMap.keys():
                cur = db.get(clientMap[ID])
                if hasTimeChanged(cur['last'],params[2].strip()):
                    print 'client exists AND updating'
                    updateClient(cur,params)
                else:
                    print 'client exists not updating'
            else:
                print 'adding new client'
                print ID
                # print clientMap.keys()
                # print routerMap.values()
                addClient(params)

def hasTimeChanged(last, newTime):
        try:
          lastTimeSeen = datetime.strptime(last, "%Y-%m-%dT%H:%M:%SZ")
          curTime = datetime.strptime(newTime, "%Y-%m-%d %H:%M:%S")
        except ValueError:
          logging.error("invalid time: " +newTime);

        else:
            if (curTime - lastTimeSeen) > timedelta(seconds = 1):
                return True
            else:
                return False

def addRouter(params):
    _bssid = params[0].strip()
    _essid= params[13]
    # print params
    _first = datetime.strptime(params[1].strip(), "%Y-%m-%d %H:%M:%S")
    _last  = datetime.strptime(params[2].strip(), "%Y-%m-%d %H:%M:%S")
    _power = 0
    try:
        newValue = int(params[8])
        if newValue >= -1 and newValue <=0:
            _power =  -128
        else:
            _power =  newValue
    except ValueError:        
        print 'Bogus power value'
    
    node = Node(
     kind="Router",
     bssid=_bssid,
     essid=_essid,
     created_at = datetime.now(),
     first = _first,
     last = _last,
     power = _power
    )
    # save it 
    node.save()

def addClient(params):
    _bssid = params[0].strip()
    _ap_essid = params[5]
    
    _first = datetime.strptime(params[1].strip(), "%Y-%m-%d %H:%M:%S")
    _last  = datetime.strptime(params[2].strip(), "%Y-%m-%d %H:%M:%S")

    # _probes = params[6:]
    _probes = list()
    for p in params[6:]:
        p = p.decode('utf-8', 'ignore')
        _probes.append(p.strip())

    _power = 0
    try:
        newValue = int(params[3])
        if newValue >= -1 and newValue <=    0:
            _power =  -128
        else:
            _power =  newValue
    except ValueError:        
        print 'Bogus power value'

    node = Node(
     kind="Client",
     bssid= _bssid,
     essid="NA",
     created_at = datetime.now(),
     first = _first,
     last = _last,
     power = _power,
     probes = _probes,
     ap_essid = _ap_essid

    )
    print params
    print type(node.first)
    print type(node.last)
    print node.probes
    print node.power
    # save it 
    node.save()

def updateRouter(cur,params):
    node = cur#db.get(routerMap[cur])
    #time
    node['first'] = datetime.strptime(params[1], "%Y-%m-%d %H:%M:%S")
    node['last'] = datetime.strptime(params[2], "%Y-%m-%d %H:%M:%S")
    #power
    try:
        newValue = int(params[8])
        if newValue >= -1 and newValue <=0:
            node['power'] =  -128
        else:
            node['power'] =  newValue
    except ValueError:        
        print 'Bogus power value'
    #essid
    node['essid'] = params[13]
    db.save_doc(node)

def updateClient(cur,params):
    node = cur#db.get(clientMap[cur])
    #time
    _first = DateTimeProperty()
    _last  = DateTimeProperty()
    _first = datetime.strptime(params[1].strip(), "%Y-%m-%d %H:%M:%S")
    _last = datetime.strptime(params[2].strip(), "%Y-%m-%d %H:%M:%S")
    print type(_last)
    node['first'] = _first
    node['last'] = _last
    #power
    try:
        newValue = int(params[3])
        if newValue >= -1 and newValue <=    0:
            node['power'] =  -128
        else:
            node['power'] =  newValue
    except ValueError:        
        print 'Bogus power value'
    #ap
    if node['ap_essid'] == params[5]:
        pass
    else:
        logging.debug("AP updated from : " +  self.AP + " to "+params[5] +"|"+self.lastTimeSeen)
        node['ap_essid'] = params[5]
        #using the pipe to be keep track of when the client was associated to a router and update if it changes
        # newAP = self.AP + "|" + self.lastTimeSeen
        # self.forDB["essid"].append(newAP)
    #probes
    newProbes = params[6:]
    for p in newProbes:#node['probes']:
        p = p.strip()
        if not p in node['probes']:
            p = unicode(p, errors='replace')
            node['probes'].append(p)

    db.save_doc(node)

if __name__ == '__main__' :

    # fileName = sys.argv[1]
     # server object
    server = Server("http://localhost:5984")

    # create database
    db = server.get_or_create_db("node")
    Node.set_db(db)
    for i in db.all_docs():
        key = i['id']

        value = db.get(i['id']) 
        # print value
        # print value['kind']
        if value['bssid'] in routerMap.keys():
            print value['bssid']
        if value['kind'] == 'Router':
            # print "Im a " + value['kind'] + " with ID: "+  value['id']
            routerMap[value['bssid']] = value['_id']
        elif value['kind'] == 'Client' :
            # print "Im a " + value['kind'] + " with ID: "+  value['id']
            clientMap[value['bssid']] = value['_id']


    # try :
    #     while 1 :

            # time.sleep(1)
    # print type(routerMap.keys()[0])
    # print clientMap
    print "test"
    csv = open("test.csv", 'r')
    readFile(csv)
    csv.close()



    # except KeyboardInterrupt :
    #         print "\nClosing OSCServer."
    #         # mine.s.close()
    #         # print "Waiting for Server-thread to finish"
    #         # mine.st.join() ##!!!
    #         print "Done"

    # for k,v in clientMap.iteritems():
    #     print db.get(v)     
    