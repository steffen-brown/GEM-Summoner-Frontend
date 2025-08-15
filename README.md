# GEM Summoner Frontend

[![UIUC ECE 484](https://img.shields.io/badge/Course-ECE%20484-orange)](https://ece.illinois.edu/)

React-based web interface for the **GEM Summoner** project, enabling users to trigger the autonomous “Summon” sequence for a GEM e2 electric vehicle using the device’s live GPS location.

## Features
- Uses device GPS as the summon target  
- Displays current vehicle position  
- Simple **Summon** control to start the autonomous sequence  
- Real-time status updates from the backend API  

## Related Repositories
- Backend API: [GEM-Summon-Backend](https://github.com/steffen-brown/GEM-Summon-Backend)  
- Vehicle firmware and ROS system: [GEM-Summon-Firmware](https://github.com/steffen-brown/GEM-Summon-Firmware)  

## Running Locally
```bash
npm install
npm start
