using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

namespace PaperForgeLauncher
{
    class Program
    {
        private static Process serverProcess = null;
        private static bool isExiting = false;

        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.Title = "PaperForge Studio — Exam Paper Maker";

            // Graceful shutdown handling
            Console.CancelKeyPress += (sender, e) =>
            {
                e.Cancel = true;
                Shutdown();
            };
            AppDomain.CurrentDomain.ProcessExit += (sender, e) => Shutdown();

            PrintBanner();

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(appDir);

            // Step 1: Check if already running on port 3001
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.Write("[1/3] ");
            Console.ResetColor();
            Console.WriteLine("Checking local port 3001...");

            if (IsServerAlive("http://localhost:3001"))
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("  ✓ PaperForge server is already active on http://localhost:3001");
                Console.ResetColor();
            }
            else
            {
                // Step 2: Locate Node.js
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("[2/3] ");
                Console.ResetColor();
                Console.WriteLine("Locating Node.js runtime...");

                string nodePath = FindNodeExecutable();
                if (string.IsNullOrEmpty(nodePath))
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("  ✗ Node.js was not found on your system.");
                    Console.ResetColor();
                    Console.WriteLine("\n  PaperForge requires Node.js (v18+) to run.");
                    Console.WriteLine("  Download it free from: https://nodejs.org\n");
                    Console.Write("  Press [Enter] to open the Node.js website or any other key to exit...");
                    if (Console.ReadKey().Key == ConsoleKey.Enter)
                    {
                        OpenBrowser("https://nodejs.org/en/download");
                    }
                    return;
                }

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("  ✓ Found Node.js: " + nodePath);
                Console.ResetColor();

                // Check server/server.js
                string serverScript = Path.Combine(appDir, "server", "server.js");
                if (!File.Exists(serverScript))
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("  ✗ Cannot find server/server.js in " + appDir);
                    Console.ResetColor();
                    Console.WriteLine("  Press any key to exit...");
                    Console.ReadKey();
                    return;
                }

                // Check node_modules
                string nodeModules = Path.Combine(appDir, "node_modules");
                if (!Directory.Exists(nodeModules))
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("  Dependencies not found. Running npm install (first time setup)...");
                    Console.ResetColor();
                    RunNpmInstall(appDir);
                }

                // Launch server process
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.Write("[3/3] ");
                Console.ResetColor();
                Console.WriteLine("Starting PaperForge server backend...");

                StartServer(nodePath, serverScript, appDir);

                // Wait for server to become responsive
                bool ready = false;
                for (int i = 0; i < 20; i++)
                {
                    Thread.Sleep(500);
                    if (IsServerAlive("http://localhost:3001"))
                    {
                        ready = true;
                        break;
                    }
                }

                if (ready)
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("  ✓ Server successfully started and responding!");
                    Console.ResetColor();
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("  Server launched, waiting for readiness...");
                    Console.ResetColor();
                }
            }

            // Step 3: Open Browser
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine("  ➔ Opening PaperForge in your default web browser...");
            Console.ResetColor();
            OpenBrowser("http://localhost:3001");

            PrintControls();

            // Interactive control loop
            while (!isExiting)
            {
                if (Console.KeyAvailable)
                {
                    var key = Console.ReadKey(true).Key;
                    if (key == ConsoleKey.Q || key == ConsoleKey.Escape)
                    {
                        break;
                    }
                    else if (key == ConsoleKey.O)
                    {
                        Console.WriteLine("  Re-opening browser: http://localhost:3001");
                        OpenBrowser("http://localhost:3001");
                    }
                }
                Thread.Sleep(200);
            }

            Shutdown();
        }

        private static void PrintBanner()
        {
            Console.ForegroundColor = ConsoleColor.DarkYellow;
            Console.WriteLine(@"
    ██████╗  █████╗ ██████╗ ███████╗██████╗ ███████╗ ██████╗ ██████╗  ██████╗ ███████╗
    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
    ██████╔╝███████║██████╔╝█████╗  ██████╔╝█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
    ██╔═══╝ ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
    ██║     ██║  ██║██║     ███████╗██║  ██║██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
    ╚═╝     ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("            Exam Paper Generator & Hierarchical Question Bank Studio");
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("                        Engineered by PANKAJ SHARMA");
            Console.WriteLine("            ════════════════════════════════════════════════════════");
            Console.ResetColor();
            Console.WriteLine();
        }

        private static void PrintControls()
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("  ──────────────────────────────────────────────────────────────────");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  PaperForge Studio is running! URL: http://localhost:3001");
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.WriteLine("  Controls:");
            Console.WriteLine("    [O] - Open web interface in browser");
            Console.WriteLine("    [Q] - Stop PaperForge and exit");
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("  ──────────────────────────────────────────────────────────────────");
            Console.ResetColor();
            Console.WriteLine();
        }

        private static bool IsServerAlive(string url)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(url);
                request.Method = "GET";
                request.Timeout = 1200;
                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static string FindNodeExecutable()
        {
            // Check PATH first
            try
            {
                var psi = new ProcessStartInfo("where", "node")
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };
                using (var p = Process.Start(psi))
                {
                    string output = p.StandardOutput.ReadToEnd().Trim();
                    p.WaitForExit();
                    if (p.ExitCode == 0 && !string.IsNullOrEmpty(output))
                    {
                        var lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                        if (lines.Length > 0 && File.Exists(lines[0])) return lines[0];
                    }
                }
            }
            catch { }

            // Check standard file locations
            string[] candidatePaths = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\node\node.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"npm\node.exe")
            };

            foreach (var path in candidatePaths)
            {
                if (File.Exists(path)) return path;
            }

            return null;
        }

        private static void RunNpmInstall(string workingDir)
        {
            try
            {
                var psi = new ProcessStartInfo("cmd.exe", "/c npm install")
                {
                    WorkingDirectory = workingDir,
                    UseShellExecute = false
                };
                var p = Process.Start(psi);
                p.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine("  npm install error: " + ex.Message);
            }
        }

        private static void StartServer(string nodePath, string scriptPath, string workingDir)
        {
            try
            {
                var psi = new ProcessStartInfo(nodePath, "\"" + scriptPath + "\"")
                {
                    WorkingDirectory = workingDir,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("  Failed to start server: " + ex.Message);
                Console.ResetColor();
            }
        }

        private static void OpenBrowser(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch
            {
                try
                {
                    Process.Start("cmd.exe", "/c start " + url);
                }
                catch { }
            }
        }

        private static void Shutdown()
        {
            if (isExiting) return;
            isExiting = true;

            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("  Shutting down PaperForge Studio...");
            Console.ResetColor();

            if (serverProcess != null && !serverProcess.HasExited)
            {
                try
                {
                    serverProcess.Kill();
                    serverProcess.WaitForExit(1000);
                }
                catch { }
            }

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("  ✓ Goodbye!");
            Console.ResetColor();
            Environment.Exit(0);
        }
    }
}
