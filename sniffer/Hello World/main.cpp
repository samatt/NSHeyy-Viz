#include <iostream>
#include <set>
#include <string>
//#include <tins/tins.>
#include "tins.h"
#include <signal.h>

using namespace Tins;
using namespace std;

void addRadioHeader(stringstream& ss, const RadioTap& rf,Timestamp& t){
#if defined DEBUG_LOG
    ss<<to_string(t.milli())<<"Radio,"<<std::to_string((rf.db_signal ()))<<","<<rf.channel_freq()<<","<<rf.channel_type()<<",";
#else
    ss<<to_string(t.seconds())<<","<<"Radio,"<<std::to_string((rf.dbm_signal()))<<","<<rf.channel_freq()<<","<<rf.channel_type()<<",";
#endif
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
        
        if(d11_b.matches_flag(Tins::PDU::PDUType::DOT11_BEACON)){
            
            //addr2 == bssid == addr3
            addRadioHeader(ss, rf,t);
#if defined DEBUG_LOG
            ss<<"Beacn,"<< "ap_id:" <<d11_b.addr2()<<",st_id:"<<d11_b.ssid()<<",ap_channel:"<<to_string(d11_b.ds_parameter_set());
#else
            try{
                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid();
                //                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid()<<","<<to_string(d11_b.ds_parameter_set());
            }
            catch(option_not_found){
                //                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid();
            }
#endif
        }
        else if(d11.matches_flag(Tins::PDU::PDUType::DOT11_PROBE_REQ) ){
            //addr1,addr3==broadcast, addr2 == station
            addRadioHeader(ss, rf,t);
#if defined DEBUG_LOG
            ss<<"Probe, st_id:" <<d11_b.addr2()<<",essid:"<<d11_b.ssid();
#else
            ss<<"Probe," <<d11_b.addr2()<<","<<d11_b.ssid();
#endif
        }
    }
    else if (d11.matches_flag(Tins::PDU::DOT11_DATA)){
        const Dot11Data &data = pdu.rfind_pdu<Dot11Data>();
        //cout<<"DATA"<<endl;
        if (data.to_ds() == 1 && data.from_ds() == 1) {
            //receiver,transmitter,destination
        }
        else if (data.to_ds() == 1 && data.from_ds() == 0) {
            //bssid,destination,source;
        }
        else if (data.to_ds() == 0 && data.from_ds() == 1) {
            //destination,bssid,source
            //if to == 0 && from ==1 && addr2 == aadr3
            //  addr1 = client and addr2/3 = ap
            
            if(data.addr2() == data.addr3()){
                addRadioHeader(ss, rf,t);
                
#ifdef DEBUG_LOG
                ss<<"Data,st_id:"<<data.addr1()<<","<<"ap_id:"<<data.addr2();
#else
                ss<<"Data,"<<data.addr1()<<","<<data.addr2();
#endif
            }
        }
        else if (data.to_ds() == 0 && data.from_ds() == 0) {
            //destination, source, bssid
        }
    }
    if(ss.str().length()>6){
        file <<ss.str()<<endl;
        cout<< ss.str();
        
    }
    return true;
}

int main(int argc, char* argv[]) {
    
    std::string interface = "en0";
    if(argc == 2)
    interface = argv[1];
    ofstream file;
    file.open("/Users/surya/Desktop/packets.log", ios::ate);
//    Sniffer sniffer;
    Sniffer sniffer(interface, 2000, true, "type mgt or type data", true);
    
    while(Packet pkt = sniffer.next_packet()) {
//        pkt.pdu(); // <- pdu
        Timestamp t=pkt.timestamp();
        processPacket(*pkt.pdu(),file,t);
        
//       cout<< to_string(t.seconds())<<endl; // <- tim estamp
    }

    std::cout <<"Closing file"<<std::endl;
    file.close();
//    sniffer.run(interface);
    
}


//******************** OLD CODE ****************************//
// Define the function to be called when ctrl-c (SIGINT) signal is sent to process
//
//void signal_callback_handler(int signum){
//    printf("Caught signal %d\n",signum);
//    // Cleanup and close up stuff here
//    // Terminate program
//    exit(signum);
//}
////#define DEBUG_LOG
//
//class Dot11Sniffer {
//    public:
//    void run(const std::string &iface);
//    ~Dot11Sniffer();
//    
//    private:
//    typedef Dot11::address_type address_type;
//    typedef std::set<address_type> ssids_type;
//    string test = " ";
//    int loop=0;
//    bool callback(PDU &pdu);
//    ofstream file;
//    ssids_type ssids;
//    void addRadioHeader(stringstream& ss, const RadioTap& rf);
//    
//};
//
//
//Dot11Sniffer::~Dot11Sniffer(){
//    std::cout <<"Closing file"<<std::endl;
//    file.close();
//}
//void Dot11Sniffer::run(const std::string &iface) {
//    file.open("/Users/surya/Desktop/test.log", ios::ate);
//    Sniffer sniffer(iface, 2000, true, "type mgt or type data", true);
//    sniffer.sniff_loop(make_sniffer_handler(this, &Dot11Sniffer::callback));
//}
//
//void Dot11Sniffer::addRadioHeader(stringstream& ss, const RadioTap& rf){
//#if defined DEBUG_LOG
//    ss<<"Radio,"<<std::to_string((rf.db_signal ()))<<","<<rf.channel_freq()<<","<<rf.channel_type()<<",";
//#else
//    ss<<"Radio,"<<std::to_string((rf.db_signal ()))<<","<<rf.channel_freq()<<","<<rf.channel_type()<<",";
//#endif
//}
//
//bool Dot11Sniffer::callback(PDU &pdu) {
//    
//    const Dot11 &d11 = pdu.rfind_pdu<Dot11>();
//    const RadioTap &rf =  pdu.rfind_pdu<RadioTap>();
//    stringstream ss;
//    ss<<""<<endl;
//    Packet p  = Packet();
//    
//    
//    if (d11.matches_flag(Tins::PDU::DOT11_MANAGEMENT)) {
//        
//        const Dot11ManagementFrame &d11_b = pdu.rfind_pdu<Dot11ManagementFrame>();
//        //For more info
//        //http://www.wildpackets.com/resources/compendium/wireless_lan/wlan_packets#wp1000868
//        if (!d11_b.to_ds() && !d11_b.from_ds()) {
//            //addr1: Destination
//            //addr2: Source
//            //addr3: BSSID
//        }
//        
//        if(d11_b.matches_flag(Tins::PDU::PDUType::DOT11_BEACON)){
//            
//            //addr2 == bssid == addr3
//            addRadioHeader(ss, rf);
//#if defined DEBUG_LOG
//            ss<<"Beacn,"<< "ap_id:" <<d11_b.addr2()<<",st_id:"<<d11_b.ssid()<<",ap_channel:"<<to_string(d11_b.ds_parameter_set());
//#else
//            try{
//                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid();
//                //                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid()<<","<<to_string(d11_b.ds_parameter_set());
//            }
//            catch(option_not_found){
//                //                ss<<"Beacn,"<<d11_b.addr2()<<","<<d11_b.ssid();
//            }
//#endif
//        }
//        else if(d11.matches_flag(Tins::PDU::PDUType::DOT11_PROBE_REQ) ){
//            //addr1,addr3==broadcast, addr2 == station
//            addRadioHeader(ss, rf);
//#if defined DEBUG_LOG
//            ss<<"Probe, st_id:" <<d11_b.addr2()<<",essid:"<<d11_b.ssid();
//#else
//            ss<<"Probe," <<d11_b.addr2()<<","<<d11_b.ssid();
//#endif
//        }
//    }
//    else if (d11.matches_flag(Tins::PDU::DOT11_DATA)){
//        const Dot11Data &data = pdu.rfind_pdu<Dot11Data>();
//        //cout<<"DATA"<<endl;
//        if (data.to_ds() == 1 && data.from_ds() == 1) {
//            //receiver,transmitter,destination
//        }
//        else if (data.to_ds() == 1 && data.from_ds() == 0) {
//            //bssid,destination,source;
//        }
//        else if (data.to_ds() == 0 && data.from_ds() == 1) {
//            //destination,bssid,source
//            //if to == 0 && from ==1 && addr2 == aadr3
//            //  addr1 = client and addr2/3 = ap
//            
//            if(data.addr2() == data.addr3()){
//                addRadioHeader(ss, rf);
//                
//#ifdef DEBUG_LOG
//                ss<<"Data,st_id:"<<data.addr1()<<","<<"ap_id:"<<data.addr2();
//#else
//                ss<<"Data,"<<data.addr1()<<","<<data.addr2();
//#endif
//            }
//        }
//        else if (data.to_ds() == 0 && data.from_ds() == 0) {
//            //destination, source, bssid
//        }
//    }
//    if(ss.str().length()>6){
//        file <<ss.str()<<endl;
//        cout<< ss.str();
//        
//    }
//    return true;
//}

//int main(int argc, char* argv[]) {
//
//    std::string interface = "en0";
//    if(argc == 2)
//    interface = argv[1];
//    Dot11Sniffer sniffer;
//    sniffer.run(interface);
//    
//}

