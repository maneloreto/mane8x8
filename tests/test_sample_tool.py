import json
import subprocess
import sys
import unittest

class SampleToolTest(unittest.TestCase):
    def test_greeting(self):
        proc = subprocess.run([sys.executable, "tools/sample_tool.py", "--name", "unittest"], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, msg=f"Non-zero exit: {proc.stderr}")
        data = json.loads(proc.stdout)
        self.assertIn("greeting", data)
        self.assertEqual(data["greeting"], "hello unittest")

if __name__ == "__main__":
    unittest.main()
