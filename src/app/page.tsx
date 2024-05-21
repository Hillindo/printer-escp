'use client';

import EscPosEncoder from 'esc-pos-encoder';
import { createCanvas, loadImage } from 'canvas';

let encoder = new EscPosEncoder();

const data = [
  { name: 'John Doe', age: 30, occupation: 'Engineer' },
  { name: 'Jane Smith', age: 25, occupation: 'Designer' },
  { name: 'Sam Johnson', age: 35, occupation: 'Developer' }
];

export default function Home() {
  function generateEscPTable(data) {
    let commands = '\x1B\x40'; // Initialize Printer
  
    // Set line spacing
    commands += '\x1B\x33\x18'; // Line spacing of 24/180 inches
  
    // Add header
    commands += 'Name\t\tAge\tOccupation\x0A';
    commands += '----------------------------\x0A';
  
    // Add rows
    data.forEach(item => {
        commands += `${item.name}\t${item.age}\t${item.occupation}\x0A`;
    });
  
    // Form Feed
    commands += '\x0C';
  
    return commands;
  }
  
  const escpCommands = generateEscPTable(data);

  const printResult = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ interfaceClass: 7 }] });
      await device.open();
      await device.claimInterface(0);
      const result = encoder
          .initialize()
          .text("Hello, world!")
          .encode();
      await device.transferOut(1, result);
    } catch (error) {
      console.error("Error printing:", error.message);
    }
  }

  return (
    <main>
      <button onClick={printResult}>Go to printer</button>
    </main>
  );
}
