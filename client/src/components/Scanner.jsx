import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function Scanner({ onScan }) {

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      () => {}
    );

    // This runs when the dialog closes
    return () => {
      scanner.clear(); // stops camera
    };

  }, []);

  return <div id="reader"></div>;
}

export default Scanner;