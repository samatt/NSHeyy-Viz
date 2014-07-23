# import urllib2
# import urllib
# import requests
# import logging
# from couchdb import json
# json.use(decode=my_decode, encode=my_encode)
# from couchdb import Server
# from couchdb.mapping import Document, TextField, IntegerField, DateTimeField, ListField
from datetime import datetime, date, time, timedelta

from couchdbkit import *

idMap =  dict()

# class Node(Document):
#     kind = TextField()
#     # bssid = TextField()
#     # essid = TextField()
#     # ap_essid = TextField()
#     # ap_essid = TextField()
#     # firstTimeSeen = DateTimeField(default=datetime.now)
#     # lastTimeSeen = DateTimeField(default=datetime.now)
#     # power = IntegerField()
#     # probes = ListField(TextField(default = "a"))
    
    
#     # ip = TextField()
#     # Channel = TextField()
#     # Speed = TextField()
#     # Privacy = TextField()
class Node(Document):
    kind = StringProperty()
    id = StringProperty()
    essid = StringProperty()
    ap_essid = StringProperty()
    created_at =DateTimeProperty()
    # bssid = TextField()
    # essid = TextField()
    # ap_essid = TextField()
    # ap_essid = TextField()
    # firstTimeSeen = DateTimeField(default=datetime.now)
    # lastTimeSeen = DateTimeField(default=datetime.now)
    # power = IntegerField()
    # probes = ListField(TextField(default = "a"))
    
    
    # ip = TextField()
    # Channel = TextField()
    # Speed = TextField()
    # Privacy = TextField()


if __name__ == '__main__' :
     # server object
     server = Server("http://localhost:5984")

     # create database
     db = server.get_or_create_db("node1")

     # associate Greeting to the db
     Node.set_db(db)

     # create a new greet
     node = Node(
         kind="Client",
         id="AA:BB:CC:DD:EE:FF",
         essid="testINg",
         created_at = datetime.now()
     )

     # save it 
     node.save()
    # server = Server("http://localhost:5984")
    # db = server["nodes"]
    # db = server["nodes"]
    # # print server["nodes"]
    # # db = server["nodes"]
    # # results = db.view("_all_docs", keys=["key1", "key2"])
    # n =Node(kind = "Router")
    #         # bssid = 'FF:FF:DE:FE:FD:12',
    #         # essid = 'TestNetwork',
    #         # # firstTimeSeen =datetime(2007, 4, 1, 15, 30),
    #         # power = 145
    #         # )
    # # j = json.dumps(n)
    # server.saveDoc('nodes', doc)
    # # db.save(json.encode(n))
    # # db.save(n)

    # # map_fun = '''function(doc) {
    # #     emit(doc.bssid, doc);
    # # }'''
    
    # for row in db.view('_all_docs'):
    #     print row.bssid
    # # info = db.store()

    # # idMap["0A:0B:DE:FE:FD:12"] = info['id']

    # # info1 = db.create({'kind' : "Client",
    # #         'BSSID' : "0A:FF:BB:CC:11:22",
    # #         'ESSID' : "TestNetwork",
    # #         'firstTimeSeen' : DateTimeField()._to_json(datetime.now()),
    # #         # 'lastTimeSeen' : DateTimeField(default=datetime.now),
    # #         'Power' : 1045,
    # #         'probes':("TestProbe1")
    # #         })

    # # idMap["0A:FF:BB:CC:11:22"] = info['id']

    # # print db.get(info)
    # # print db.get(info1)