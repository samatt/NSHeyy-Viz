#include <iostream>
#include <set>
#include <string>
#include <tins/tins.h>
//#include "tins.h"
#include <signal.h>

using namespace Tins;
using namespace std;



void addRadioHeader(stringstream& ss, const RadioTap& rf,Timestamp& t){
    try{
        ss<<to_string(t.seconds())<<",Radio,"<<std::to_string((rf.db_signal ()))<<","<<rf.channel_freq()<<","<<rf.channel_type()<<",";
        
    }
    catch(option_not_found){
            cout<<"ERROR OPTION NOT FOUND IGNORING PACKET"<<endl;
    }
}
bool processPacket(PDU &pdu, ostream& file,Timestamp& t) {
    
    const Dot11 &d11 = pdu.rfind_pdu<Dot11>();
    const RadioTap &rf =  pdu.rfind_pdu<RadioTap>();
    stringstream ss;
    ss<<""<<endl;
    Packet p  = Packet();
    
    
    if (d11.matches_flag(Tins::PDU::DOT11_MANAGEMENT)) {
        
        const Dot11ManagementFrame &d11_b = pdu.rfind_pdu<Dot11ManagementFrame>();
        //For more info
        //http://www.wildpackets.com/resources/compendium/wireless_lan/wlan_packets#wp1000868
        if (!d11_b.to_ds() && !d11_b.from_ds()) {
            //addr1: Destination
            //addr2: Source
            //addr3: BSSID
        }
        
        if(d11_b.matches_flag(PDU::PDUType::DOT11_BEACON)){
            

            
            try{
                //addr2 == bssid == addr3
                addRadioHeader(ss, rf,t);
#if defined DEBUG_LOG
                ss<<"Beacn,"<< "ap_id:" <<d11_b.addr2()<<",st_id:"<<d11_b.ssid()<<",ap_channel:"<<to_string(d11_b.ds_parameter_set());
#else
                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid();
#endif
                //                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid()<<","<<to_string(d11_b.ds_parameter_set());
            }
            catch(option_not_found){
                cout<<"ERROR OPTION NOT FOUND IGNORING PACKET"<<endl;
            }
            
        }
        else if(d11.matches_flag(PDU::PDUType::DOT11_PROBE_REQ) ){
            //addr1,addr3==broadcast, addr2 == station

            
            try{
                addRadioHeader(ss, rf,t);
#if defined DEBUG_LOG
                ss<<"Probe, st_id:" <<d11_b.addr2()<<",essid:"<<d11_b.ssid();
#else
                ss<<"Probe," <<d11_b.addr2()<<","<<d11_b.ssid();
#endif
            }
            catch(option_not_found){
                cout<<"ERROR OPTION NOT FOUND IGNORING PACKET"<<endl;
            }
            
            
        }
    }
    else if (d11.matches_flag(PDU::DOT11_DATA)){
        const Dot11Data &data = pdu.rfind_pdu<Dot11Data>();
        //cout<<"DATA"<<endl;
        //        if (data.to_ds() == 1 && data.from_ds() == 1) {
        //            //receiver,transmitter,destination
        //        }
        //        else if (data.to_ds() == 1 && data.from_ds() == 0) {
        //            //bssid,destination,source;
        //        }
        
        //destination,bssid,source
        //if to == 0 && from ==1 && addr2 == aadr3
        //  addr1 = client and addr2/3 = ap
        
        
        
        try{
            if (data.to_ds() == 0 && data.from_ds() == 1) {
                if(data.addr2() == data.addr3()){
                    addRadioHeader(ss, rf,t);
#ifdef DEBUG_LOG
                    ss<<"Data,st_id:"<<data.addr1()<<","<<"ap_id:"<<data.addr2();
#else
                    ss<<"Data,"<<data.addr1()<<","<<data.addr2();
                }
#endif
            }
        }
        catch(option_not_found){
            cout<<"ERROR OPTION NOT FOUND IGNORING PACKET"<<endl;
        }
        
        
        
        //        }
        //        else if (data.to_ds() == 0 && data.from_ds() == 0) {
        //            //destination, source, bssid
        //        }
    }
    if(ss.str().length()>6){
        
        //#ifdef DEBUG_LOG
        cout<< ss.str()<<endl;
        //#else
        //       file <<ss.str()<<endl;
        //#endif
    }
    return true;
}

int main(int argc, char* argv[]) {
    
    std::string interface = "en0";
    if(argc == 2)
        interface = argv[1];
    cout<<interface<<endl;
    ofstream file;

    cout<<"EXECUTING!!!"<<endl;
    //    Sniffer sniffer;
    try {
        Sniffer sniffer(interface, 2000, true, "type mgt or type data", true);
        while(Packet pkt = sniffer.next_packet()) {
            Timestamp t=pkt.timestamp();
            processPacket(*pkt.pdu(),file,t);
        }
    }
    catch(std::runtime_error &ex    ){
        std::cout << "[-] Error: " << ex.what() << std::endl;
    }
}


