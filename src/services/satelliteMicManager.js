/**
 * VANII Whole-Home Satellite Mic Manager (ESP32-S3 / Wyoming Protocol)
 * Features:
 * 1. Distributed Room Satellite Registry: Living Room, Bedroom, Office, Kitchen.
 * 2. Room-Aware Presence Detection: Routes voice responses to the active room speaker.
 * 3. Satellite Health & Signal Telemetry.
 */

export class SatelliteMicManager {
  constructor() {
    this.satellites = [
      { id: 'sat_living', name: 'Living Room ESP32-S3', room: 'Living Room', status: 'ONLINE', signalDbm: -54, isActiveTarget: true },
      { id: 'sat_bedroom', name: 'Bedroom ESP32-S3 Box', room: 'Bedroom', status: 'ONLINE', signalDbm: -62, isActiveTarget: false },
      { id: 'sat_office', name: 'Office PC / Raspberry Pi', room: 'Office Studio', status: 'ONLINE', signalDbm: -48, isActiveTarget: false },
      { id: 'sat_kitchen', name: 'Kitchen Satellite Mic', room: 'Kitchen', status: 'ONLINE', signalDbm: -68, isActiveTarget: false },
    ];
    this.currentRoom = 'Living Room';
  }

  setActiveRoom(roomName) {
    this.currentRoom = roomName;
    this.satellites.forEach((sat) => {
      sat.isActiveTarget = sat.room.toLowerCase() === roomName.toLowerCase();
    });
    return { currentRoom: this.currentRoom, satellites: this.satellites };
  }

  getAllSatellites() {
    return [...this.satellites];
  }

  getActiveRoom() {
    return this.currentRoom;
  }
}

export const satelliteMicInstance = new SatelliteMicManager();
