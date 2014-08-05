# -- coding: utf-8 --
# import requests

from datetime import datetime, date, time, timedelta
from couchdbkit import *
import sys
import os
import time
import random

from datetime import datetime
from dateutil import tz


# METHOD 1: Hardcode zones:
from_zone = tz.gettz('UTC')
to_zone = tz.gettz('America/New_York')

# METHOD 2: Auto-detect zones:
# from_zone = tz.tzutc()
# to_zone = tz.tzlocal()

routerMap = dict()
clientMap = dict()

TIMESTAMP  = 0
RADIO  = 1
RADIO_SIGNAL_STRENGTH = 2
RADIO_FREQUENCY = 3
RADIO_CHANNEL_TYPE = 4
PACKET_TYPE = 5
BEACON_AP_BSSID = 6
BEACON_AP_ESSID = 7
BEACON_CHANNEL = 8
PROBE_ST_BSSID = 6
PROBE_PROBED_ESSID = 7
DATA_ST_BSSID = 6
DATA_AP_BSSID = 7

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
    timestamp = IntegerProperty()

def readLine(line):

    line.strip()
    line = line.replace("\n"," ")
    line = line.strip()
    params = line.split(',')
    if len(params) <6:
        
        return
    # print params
    
    if params[PACKET_TYPE] == "Beacn":
        if params[BEACON_AP_BSSID] in routerMap.keys():
            cur = db.get(routerMap[params[PROBE_ST_BSSID]])
            updateRouter(cur,params)
            # print "update Router"
        else:
            addRouter(params)
            # print "add Router"
    else:
        if params[PROBE_ST_BSSID] in clientMap.keys():
            # print para    ms
            # print clientMap.keys()
            cur = db.get(clientMap[params[PROBE_ST_BSSID]])
            updateClient(cur,params)
            # print "update Client"
        else:
            # print "add Client"
            addClient(params)


def addRouter(params):
    
    # TODO: Add these params to the DB and Add First and last time seen properly again  
    # params[RADIO_FREQUENCY]
    # params[RADIO_CHANNEL_TYPE]
    # params[BEACON_CHANNEL]
    
    # Tell the datetime object that it's in UTC time zone since 
# datetime objects are 'naive' by default
    cur_tz = datetime.utcfromtimestamp(int(params[0]))
    # utc = _utc.replace(tzinfo=from_zone)
    # cur_tz = utc.astimezone(to_zone)

    node = Node(
     kind="Router",
     bssid=params[BEACON_AP_BSSID],
     essid=params[BEACON_AP_ESSID],
     created_at = datetime.now(),
     first = cur_tz,
     last = cur_tz,
     timestamp = int(params[TIMESTAMP]),
     power = int(params[RADIO_SIGNAL_STRENGTH])
    )
    # save it 
    node.save()
    routerMap[node['bssid']] = node['_id']
    # print node


def addClient(params):
    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    # utc = _utc.replace(tzinfo=from_zone)
    # cur_tz = utc.astimezone(to_zone)
    print type(datetime.now())
    _probes = list()    
    if params[PACKET_TYPE] == "Probe":
        
        _probes.append(params[PROBE_PROBED_ESSID])

        node = Node(
            kind="Client",
            bssid= params[PROBE_ST_BSSID],
            essid="NA",
            # created_at = datetime.now(),
            first = cur_tz,
            last = cur_tz,
            power = int(params[RADIO_SIGNAL_STRENGTH]),
            timestamp = int(params[TIMESTAMP]),
            probes = _probes,
            ap_essid = "")
        node.save()
        clientMap[node['bssid']] = node['_id']
        # print node

    #TODO: Add a lookup for Router BSSID to ESSID
    #NOTE: The signal strenght we're picking up from this packet is coming from the router not the client/station
    elif params[PACKET_TYPE] == "Data":
        node = Node(
            kind="Client",
            bssid= params[DATA_ST_BSSID],
            essid="NA",
            # created_at = datetime.now(),
            first = cur_tz,
            last = cur_tz,
            timestamp = int(params[TIMESTAMP]),
            power = int(params[RADIO_SIGNAL_STRENGTH]),
            probes = _probes,
            ap_essid = params[DATA_AP_BSSID])
        node.save()
        clientMap[node['bssid']] = node['_id']
        # print node

    
    

def updateRouter(cur,params):
    node = cur
    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    # utc = _utc.replace(tzinfo=from_zone)
    # cur_tz = utc.astimezone(to_zone)
    #power
    node['power'] =  int(params[RADIO_SIGNAL_STRENGTH])
    node['last'] = str(cur_tz)
    #essid
    node['timestamp'] = int(params[TIMESTAMP])
    node['essid'] = params[BEACON_AP_ESSID]
    db.save_doc(node)

def updateClient(cur,params):
    node = cur

    cur_tz = datetime.utcfromtimestamp(int(params[TIMESTAMP]))
    # utc = _utc.replace(tzinfo=from_zone)
    # cur_tz = utc.astimezone(tzinfo=to_zone)
    # print "***********"
    # print type(datetime.now())
    # print type(cur_tz)
    # print dir(node['last'])
    node['last'] = str(cur_tz)
    node['timestamp'] = int(params[TIMESTAMP])
    _probes = list()
    if params[PACKET_TYPE] == "Probe":
        
        if params[PROBE_PROBED_ESSID] not in node['probes']:
            node['probes'].append(params[PROBE_PROBED_ESSID])
            power = int(params[RADIO_SIGNAL_STRENGTH]),

    elif params[PACKET_TYPE] == "Data":
        node['ap_essid'] = params[DATA_AP_BSSID]

    node['power'] =  int(params[RADIO_SIGNAL_STRENGTH])
    db.save_doc(node)

if __name__ == '__main__' :

    # output = file("wifiCorpus_HOPEX.csv","a")
    # i =0
    # f =  ""
    server = Server("http://localhost:5984")

    db = server.get_or_create_db("test2")
    Node.set_db(db)
    for i in db.all_docs():
        key = i['id']

        value = db.get(i['id']) 

        if 'kind' in value.keys():
            if value['bssid'] in routerMap.keys():
                print value['bssid']
            if value['kind'] == 'Router':
                # print "Im a " + value['kind'] + " with ID: "+  value['id']
                routerMap[value['bssid']] = value['_id']

            if value['kind'] == 'Client' :
                # print "Im a " + value['kind'] + " with ID: "+  value['id']
                clientMap[value['bssid']] = value['_id']
                # if len(value["probes"]) >0:
                    # print "Client :" + str(i) + " of "+ str(len(db.all_docs()))
                    # sentence = value['bssid'] + ","
                    # sentence += ",".join(value["probes"])
                    # sentence += "\n"
                    # print sentence
                    # f += sentence.encode('utf-8')
    
    # output.write(f)
    # output.close

    # csv = open("/Users/surya/Desktop/test.log", 'r')
    # for line in csv:
    #     readLine(line)
    # csv.close()
##########TAIL IMPLEMENTATION
    filename = '../sniffer/build/Release/packets.log'
    file = open(filename,'r')

    #Find the size of the file and move to the end
    st_results = os.stat(filename)
    st_size = st_results[6]
    file.seek(st_size)


    while 1:
        where = file.tell()
        line = file.readline()
        if not line:
            time.sleep(1)
            file.seek(where)
        else:
            readLine(line)
            print line,