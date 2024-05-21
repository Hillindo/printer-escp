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
  async function printEscPTable(device, data) {
    // Helper function to convert a string to Uint8Array
    function strToUint8Array(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    // Function to repeat a character for a specified length
    function repeatChar(char, length) {
        return new Array(length + 1).join(char);
    }

    // Initialize ESC/P commands
    let commands = [];

    // Initialize printer (ESC @)
    commands.push(...strToUint8Array('\x1B\x40'));

    // Set line spacing (ESC 3 n)
    commands.push(...strToUint8Array('\x1B\x33\x18')); // Line spacing of 24/180 inches

    // Define table dimensions
    const colWidths = [20, 5, 20]; // Adjust column widths as needed
    const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length + 1;

    // Draw top border
    commands.push(...strToUint8Array(`+${repeatChar('-', totalWidth - 2)}+\n`));

    // Add header
    const header = ['Name', 'Age', 'Occupation'];
    let headerRow = '|';
    header.forEach((title, index) => {
        headerRow += ` ${title}${repeatChar(' ', colWidths[index] - title.length - 1)} |`;
    });
    commands.push(...strToUint8Array(`${headerRow}\n`));

    // Draw header bottom border
    commands.push(...strToUint8Array(`+${repeatChar('-', totalWidth - 2)}+\n`));

    // Add table rows
    data.forEach(item => {
        let row = '|';
        row += ` ${item.name}${repeatChar(' ', colWidths[0] - item.name.length - 1)} |`;
        row += ` ${item.age}${repeatChar(' ', colWidths[1] - item.age.toString().length - 1)} |`;
        row += ` ${item.occupation}${repeatChar(' ', colWidths[2] - item.occupation.length - 1)} |`;
        commands.push(...strToUint8Array(`${row}\n`));
    });

    // Draw bottom border
    commands.push(...strToUint8Array(`+${repeatChar('-', totalWidth - 2)}+\n`));

    // Form Feed (FF)
    commands.push(...strToUint8Array('\x0C'));

    // Convert commands array to Uint8Array
    const uint8Array = new Uint8Array(commands);

    // Send commands to printer
    await device.transferOut(1, uint8Array);
  }

  
  const printResult = async () => {
    try {
      const device = await navigator.usb.requestDevice({ filters: [{ interfaceClass: 7 }] });
      await device.open();
      await device.claimInterface(0);
      // const result = encoder
      //     .initialize()
      //     .text("Hello, world!")
      //     .encode();
      //     console.log("result", result);
      //     console.log("escpCommands", escpCommands);
      // await device.transferOut(1, escpCommands);
      await printEscPTable(device, data);
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
