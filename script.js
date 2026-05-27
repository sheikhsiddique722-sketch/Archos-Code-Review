/* ════════════════════════════════════════════════
   ARCHOS — script.js
   AI Code Review System — Full Interactive SPA
   ════════════════════════════════════════════════ */

/* ── SVG gradient for score circle ─────────────── */
document.head.insertAdjacentHTML('beforeend', `
<svg width="0" height="0" style="position:absolute">
  <defs>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6C63FF"/>
      <stop offset="100%" stop-color="#00FFD1"/>
    </linearGradient>
  </defs>
</svg>`);

/* ════════════════════════════════════════════════
   BACKGROUND CANVAS
   ════════════════════════════════════════════════ */
(function initBG() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  class Pt {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .15; this.vy = (Math.random() - .5) * .15;
      this.a = Math.random() * .4 + .05;
      this.c = Math.random() > .5 ? `rgba(108,99,255,${this.a})` : `rgba(0,255,209,${this.a * .6})`;
    }
    update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset(); }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, .8, 0, Math.PI * 2); ctx.fillStyle = this.c; ctx.fill(); }
  }

  resize();
  pts = Array.from({ length: 60 }, () => new Pt());
  window.addEventListener('resize', resize);

  function frame() {
    ctx.clearRect(0, 0, W, H);
    // Faint dot grid
    ctx.fillStyle = 'rgba(108,99,255,0.04)';
    const gs = 60;
    for (let x = 0; x < W; x += gs) for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.arc(x, y, .8, 0, Math.PI * 2); ctx.fill(); }
    // Particles + connections
    for (let i = 0; i < pts.length; i++) {
      pts[i].update(); pts[i].draw();
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 90) { ctx.strokeStyle = `rgba(108,99,255,${.06 * (1 - d / 90)})`; ctx.lineWidth = .5; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ════════════════════════════════════════════════
   CUSTOM CURSOR
   ════════════════════════════════════════════════ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mx = -100, my = -100;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left  = mx + 'px'; cursorDot.style.top  = my + 'px';
});
let rx = -100, ry = -100;
function animRing() {
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();
// Hide on leave, show on enter
document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1'; });

/* ════════════════════════════════════════════════
   LOADER
   ════════════════════════════════════════════════ */
const loaderSteps = [
  'Initializing AI Engine...',
  'Loading language models...',
  'Calibrating AST parser...',
  'Security heuristics ready...',
  'ArchOS v2.4 online.'
];
let ls = 0;
const loaderStatus = document.getElementById('loader-status');
const loaderInterval = setInterval(() => {
  ls++;
  if (ls < loaderSteps.length) loaderStatus.textContent = loaderSteps[ls];
  else clearInterval(loaderInterval);
}, 400);

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('out');
    initApp();
  }, 2200);
});

/* ════════════════════════════════════════════════
   NAV
   ════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 20);
});

function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  const h = document.getElementById('hamburger');
  const open = m.classList.toggle('open');
  h.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════
   PAGE ROUTING
   ════════════════════════════════════════════════ */
function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === id));
  const pg = document.getElementById('page-' + id);
  if (pg) { pg.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  closeMobileMenu();
  if (id === 'history') renderHistory();
  if (id === 'docs')    showDoc('getting-started');
}

/* ════════════════════════════════════════════════
   SCROLL REVEAL
   ════════════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries =>
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } }),
  { threshold: .08 }
);
function initReveal() { document.querySelectorAll('.reveal:not(.in)').forEach(el => revObs.observe(el)); }

/* ════════════════════════════════════════════════
   HERO COUNTER ANIMATION
   ════════════════════════════════════════════════ */
function animateCounters() {
  document.querySelectorAll('.hstat-num').forEach(el => {
    const raw = el.dataset.target;
    const isMil = raw.includes('M');
    const target = parseFloat(raw.replace('M', ''));
    let start = null;
    const dur = 1800;
    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      const val = target * ease;
      el.textContent = isMil ? (val < 1 ? val.toFixed(1) : val.toFixed(1)) + 'M' : val.toFixed(raw.includes('.') ? 1 : 0);
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ════════════════════════════════════════════════
   LINE NUMBERS
   ════════════════════════════════════════════════ */
const codeInput = document.getElementById('code-input');
const lineNums  = document.getElementById('line-numbers');
const editorInfo = document.getElementById('editor-info');

function updateLines() {
  const lines = codeInput.value.split('\n').length;
  lineNums.innerHTML = Array.from({ length: Math.max(lines, 10) }, (_, i) => i + 1).join('\n');
  const chars = codeInput.value.length;
  editorInfo.textContent = `${lines} line${lines !== 1 ? 's' : ''} · ${chars} char${chars !== 1 ? 's' : ''}`;
}
codeInput.addEventListener('input', updateLines);
codeInput.addEventListener('scroll', () => { lineNums.scrollTop = codeInput.scrollTop; });
// Tab support
codeInput.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = codeInput.selectionStart;
    codeInput.value = codeInput.value.slice(0, s) + '  ' + codeInput.value.slice(codeInput.selectionEnd);
    codeInput.selectionStart = codeInput.selectionEnd = s + 2;
    updateLines();
  }
});
updateLines();

/* ════════════════════════════════════════════════
   SAMPLE CODE LIBRARY
   ════════════════════════════════════════════════ */
const samples = {
  javascript: `// JavaScript: Buggy e-commerce cart module
function ShoppingCart() {
  var items = []
  var discount = null

  this.addItem = function(item, qty) {
    // Bug: no input validation
    items.push({item: item, qty: qty})
  }

  this.calculateTotal = function() {
    var total = 0
    for (var i = 0; i <= items.length; i++) { // Bug: off-by-one
      total += items[i].price * items[i].qty  // Bug: no null check
    }
    if (discount != null) {                    // Warning: != instead of !==
      total = total - (total * discount / 100)
    }
    return total
  }

  // Warning: synchronous blocking operation
  this.checkout = function() {
    var result = syncHttpRequest('/api/checkout', { items: items })
    return result
  }

  // Suggestion: function too long, violates SRP
  this.generateReport = function() {
    var report = ''
    var date = new Date()
    report += 'Date: ' + date + '\\n'
    items.forEach(function(item) {
      report += item.item + ' x' + item.qty + ' = $' + (item.price * item.qty) + '\\n'
    })
    console.log(report) // Warning: debug left in production
    return report
  }
}

var cart = new ShoppingCart()
cart.addItem("Laptop", 1)
eval(userInput) // Error: unsafe eval — XSS vulnerability`,

  python: `# Python: Data processing script with issues
import os, sys
import json, pickle

def process_user_data(filename):
    data = open(filename).read()   # Bug: file never closed
    parsed = eval(data)             # Error: eval on user data — dangerous
    
    users = []
    for i in range(0, len(parsed)):  # Suggestion: use enumerate
        user = parsed[i]
        # Warning: no type check, assumes dict
        name = user["name"]
        email = user["email"]
        
        # Bug: SQL injection vulnerability  
        query = "SELECT * FROM users WHERE email='" + email + "'"
        
        # Warning: storing plain passwords
        if user["password"] == "admin123":
            print("Admin found!")  # Warning: hardcoded credentials
        
        users.append(user)
    
    # Bug: pickle with untrusted data — arbitrary code exec
    with open("cache.pkl", "wb") as f:
        pickle.dump(users, f)
    
    return users

# Warning: global mutable state
GLOBAL_CACHE = {}

def get_user(id):
    # Bug: race condition possible in concurrent contexts
    if id in GLOBAL_CACHE:
        return GLOBAL_CACHE[id]
    user = fetch_user(id)
    GLOBAL_CACHE[id] = user
    return user`,

  cpp: `// C++: Memory management issues
#include <iostream>
#include <string>
using namespace std;

class DataBuffer {
public:
    char* buffer;
    int size;
    
    DataBuffer(int n) {
        buffer = new char[n]; // Warning: no null check after new
        size = n;
    }
    
    // Error: missing destructor — memory leak
    // ~DataBuffer() { delete[] buffer; }
    
    void copyData(const char* src, int len) {
        // Error: buffer overflow — no bounds check
        memcpy(buffer, src, len);
    }
    
    void printData() {
        // Warning: may read uninitialized memory
        printf("%s", buffer);
    }
};

int main() {
    DataBuffer buf(10);
    
    // Error: writes 20 bytes into 10-byte buffer
    buf.copyData("This is way too long for the buffer!", 36);
    
    DataBuffer* ptr = new DataBuffer(50);
    // Error: ptr never deleted — memory leak
    
    int arr[5] = {1,2,3,4,5};
    // Error: out-of-bounds access
    cout << arr[10] << endl;
    
    return 0;
}`,

  html: `<!DOCTYPE html>
<!-- HTML: Security and accessibility issues -->
<html>
<head>
  <!-- Warning: missing lang attribute on <html> -->
  <!-- Warning: missing viewport meta -->
  <title>Login</title>
</head>
<body>
  <h1>User Login</h1>
  
  <!-- Error: form submits over HTTP, not HTTPS -->
  <form action="http://example.com/login" method="GET"> <!-- Error: passwords in GET -->
    <input type="text" name="user">        <!-- Warning: missing label -->
    <input type="password" name="pass">    <!-- Warning: autocomplete not disabled -->
    <button>Login</button>
  </form>
  
  <!-- Error: XSS — directly interpolating user input -->
  <div id="greeting"></div>
  <script>
    var user = location.hash.slice(1);
    document.getElementById('greeting').innerHTML = 'Hello ' + user; // XSS
    
    // Warning: deprecated API
    document.write('<p>Today: ' + new Date() + '</p>');
  </script>
  
  <!-- Warning: missing alt attributes -->
  <img src="profile.jpg">
  <img src="logo.png">
  
  <!-- Warning: inline styles block CSP -->
  <p style="color:red;font-size:24px">Error occurred</p>
</body>
</html>`,

  css: `/* CSS: Performance and maintainability issues */

/* Warning: universal selector — performance issue */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Warning: !important overuse — specificity nightmare */
.header { color: red !important; }
.header { color: blue !important; }  /* Conflict */

/* Error: duplicate property values */
.button {
  color: white;
  background: #007bff;
  background: blue; /* Duplicate — overrides above */
  padding: 10px 20px;
  padding: 15px; /* Duplicate */
}

/* Warning: magic numbers without comments */
.sidebar { width: 247px; top: 63px; z-index: 9999; }

/* Suggestion: vendor prefixes missing */
.container {
  display: flex;
  transform: rotate(45deg);
  animation: spin 1s linear;
}

/* Warning: very deep nesting */
.page .content .section .card .header .title span { color: gray; }

/* Suggestion: use CSS variables for repeated values */
.primary { color: #6C63FF; }
.secondary { color: #6C63FF; } /* Same value — use variable */
.accent { border: 2px solid #6C63FF; }`,

  typescript: `// TypeScript: Type safety and design pattern issues
interface User {
  id: number;
  name: string;
  // Warning: missing optional marker
  email: string;
}

// Warning: using 'any' defeats TypeScript's purpose
function processData(data: any): any {
  return data.map((item: any) => item.value); // No type safety
}

// Error: non-null assertion without validation
function getUserEmail(user: User | null): string {
  return user!.email; // Crash if user is null
}

// Suggestion: use union types instead of booleans
class ApiService {
  private baseUrl: string = "http://api.example.com"; // Warning: HTTP
  
  // Warning: callback style — use async/await
  fetchUser(id: number, callback: (user: any) => void) {
    fetch(this.baseUrl + '/users/' + id) // Suggestion: template literal
      .then(res => res.json())
      .then(data => callback(data))
      // Error: unhandled promise rejection
  }
  
  // Warning: synchronous localStorage in loop — blocks main thread
  cacheUsers(users: User[]) {
    for (let i = 0; i < users.length; i++) {
      localStorage.setItem('user_' + users[i].id, JSON.stringify(users[i]));
    }
  }
}

// Error: enum misuse — string enums preferred
enum Status { Active, Inactive, Pending }
const s: Status = 99; // No compile error — unsafe`,

  java: `// Java: Common anti-patterns and bugs
import java.sql.*;
import java.util.*;

public class UserService {
  // Error: hardcoded credentials
  private static final String DB_URL = "jdbc:mysql://localhost/app";
  private static final String DB_PASS = "admin123";
  
  // Warning: Singleton without double-checked locking
  private static UserService instance;
  public static UserService getInstance() {
    if (instance == null) {
      instance = new UserService(); // Not thread-safe
    }
    return instance;
  }
  
  public User getUser(String userId) throws Exception {
    Connection conn = DriverManager.getConnection(DB_URL, "root", DB_PASS);
    
    // Error: SQL Injection vulnerability
    String sql = "SELECT * FROM users WHERE id = '" + userId + "'";
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(sql);
    
    // Bug: connection never closed — resource leak
    // Bug: no try-with-resources
    
    if (rs.next()) {
      return new User(rs.getString("name"), rs.getString("email"));
    }
    return null; // Warning: returning null — use Optional
  }
  
  // Warning: catching Exception too broadly
  public void saveUser(User user) {
    try {
      // ... save logic
    } catch (Exception e) {
      e.printStackTrace(); // Warning: debug output in production
    }
  }
}`,

  go: `// Go: Idiomatic issues and common mistakes
package main

import (
  "fmt"
  "os"
  "sync"
)

// Warning: exported struct fields without documentation
type UserCache struct {
  data map[string]User
  mu   sync.Mutex
}

// Error: nil map write — will panic
var cache = map[string]User{}

func getUser(id string) *User {
  // Warning: ignoring error return
  data, _ := os.ReadFile("users.json")
  
  // Bug: lock not deferred — won't unlock on panic
  userCache.mu.Lock()
  user := userCache.data[id]
  userCache.mu.Unlock()
  
  if user.Name == "" {
    return nil // Warning: returning nil pointer
  }
  return &user
}

// Error: goroutine leak — channel never closed
func processJobs(jobs []string) {
  results := make(chan string)
  for _, job := range jobs {
    go func() { // Bug: closure captures loop variable
      results <- process(job)
    }()
  }
  // Results channel never drained — goroutines leak
}

func main() {
  // Warning: no error handling for critical operation
  user := getUser("123")
  fmt.Println(user.Name) // Panic if user is nil
}`
};

function loadSample() {
  const lang = document.getElementById('lang-select').value;
  codeInput.value = samples[lang] || samples.javascript;
  updateLines();
  showToast('Sample code loaded ✓', 'success');
}

function clearCode() {
  codeInput.value = '';
  updateLines();
  resetResults();
  showToast('Editor cleared', 'success');
}

/* ════════════════════════════════════════════════
   AI ANALYSIS ENGINE
   ════════════════════════════════════════════════ */

/* Issue templates per language */
const analysisRules = {
  javascript: [
    { type:'error',   title:'Unsafe eval() Usage',         desc:'eval() executes arbitrary code — critical XSS and injection vulnerability. Replace with JSON.parse() or safer alternatives.',  line:'L38',  snippet:'eval(userInput)' },
    { type:'error',   title:'Off-by-one Loop Error',       desc:'Loop condition `i <= items.length` will access items[items.length] which is undefined, causing a TypeError crash.',          line:'L15',  snippet:'for (var i = 0; i <= items.length; i++)' },
    { type:'error',   title:'Null Reference Dereference',  desc:'items[i].price is accessed without null guard. If items[i] is undefined, this throws a TypeError.',                           line:'L16',  snippet:'total += items[i].price * items[i].qty' },
    { type:'warning', title:'Loose Equality Check',        desc:'Using != instead of !== allows type coercion. Use strict equality === to avoid unexpected falsy comparisons.',               line:'L19',  snippet:'if (discount != null)' },
    { type:'warning', title:'Synchronous HTTP Request',    desc:'syncHttpRequest() blocks the main thread, degrading UI responsiveness. Convert to async/await pattern.',                    line:'L25',  snippet:'var result = syncHttpRequest(...)' },
    { type:'warning', title:'console.log in Production',   desc:'Debug console.log statements leak internal data. Remove before deployment or use a logging library with levels.',           line:'L34',  snippet:"console.log(report)" },
    { type:'info',    title:'var Instead of const/let',    desc:'var has function scope and is hoisted. Use const for immutable bindings and let for reassignable variables.',               line:'L2',   snippet:'var items = []' },
    { type:'info',    title:'Function Violates SRP',       desc:'generateReport() handles formatting, I/O, and business logic. Extract into smaller, focused helper functions.',             line:'L28',  snippet:'this.generateReport = function() {' },
  ],
  python: [
    { type:'error',   title:'eval() on Untrusted Data',    desc:'Using eval() on file contents enables arbitrary code execution. Replace with json.loads() for JSON or ast.literal_eval().',  line:'L6',   snippet:'parsed = eval(data)' },
    { type:'error',   title:'SQL Injection Vulnerability', desc:'String concatenation in SQL queries allows injection attacks. Use parameterized queries with ? or %s placeholders.',          line:'L16',  snippet:"query = \"SELECT * FROM users WHERE email='\" + email + \"'\"" },
    { type:'error',   title:'Unsafe pickle Deserialization',desc:'pickle.load() with untrusted data enables arbitrary code execution (RCE). Use JSON serialization instead.',                line:'L24',  snippet:'pickle.dump(users, f)' },
    { type:'error',   title:'Hardcoded Credentials',       desc:'Hardcoded passwords in source code expose credentials in version control. Use environment variables or secrets manager.',     line:'L19',  snippet:'if user["password"] == "admin123"' },
    { type:'warning', title:'File Handle Never Closed',    desc:'open() without context manager leaks file descriptors. Wrap in `with open(...) as f:` statement.',                          line:'L5',   snippet:'data = open(filename).read()' },
    { type:'warning', title:'Race Condition Risk',         desc:'GLOBAL_CACHE read-modify-write is not atomic. Under concurrent access this creates race conditions.',                        line:'L29',  snippet:'GLOBAL_CACHE[id] = user' },
    { type:'info',    title:'Use enumerate() Instead',     desc:'range(len(parsed)) is unpythonic. Prefer `for i, item in enumerate(parsed):` for clarity.',                                line:'L10',  snippet:'for i in range(0, len(parsed))' },
  ],
  cpp: [
    { type:'error',   title:'Buffer Overflow',             desc:'memcpy writes 36 bytes into a 10-byte buffer. This overwrites adjacent memory, causes crashes or enables exploits.',         line:'L21',  snippet:'memcpy(buffer, src, len)' },
    { type:'error',   title:'Memory Leak — Missing Destructor', desc:'DataBuffer allocates heap memory with new[] but has no destructor. Add ~DataBuffer() { delete[] buffer; }.',          line:'L8',   snippet:'buffer = new char[n]' },
    { type:'error',   title:'Out-of-Bounds Array Access',  desc:'arr[10] accesses an index beyond the array size (5). This is undefined behavior — can cause crashes or data corruption.',    line:'L38',  snippet:'cout << arr[10] << endl' },
    { type:'error',   title:'Memory Leak — Pointer Never Freed', desc:'ptr is allocated with new but never deleted. The pointer goes out of scope, leaking 50 bytes permanently.',           line:'L33',  snippet:'DataBuffer* ptr = new DataBuffer(50)' },
    { type:'warning', title:'Uninitialized Memory Read',   desc:'buffer contents are undefined before copyData() is called. printf may output garbage or garbage values.',                  line:'L25',  snippet:'printf("%s", buffer)' },
    { type:'info',    title:'Missing Null Check After new', desc:'operator new throws std::bad_alloc on failure. Add a null check or use std::nothrow variant.',                             line:'L8',   snippet:'buffer = new char[n]' },
  ],
  html: [
    { type:'error',   title:'Cross-Site Scripting (XSS)',  desc:'Directly assigning user-controlled location.hash to innerHTML allows script injection. Use textContent or sanitize input.',  line:'L22',  snippet:"document.getElementById('greeting').innerHTML = 'Hello ' + user" },
    { type:'error',   title:'Password Submitted via GET',  desc:'GET requests append form data (including passwords) to the URL, exposing credentials in server logs and browser history.',   line:'L11',  snippet:'<form action="..." method="GET">' },
    { type:'error',   title:'Insecure HTTP Submission',    desc:'Form posts over HTTP send data in plaintext. Change action URL to HTTPS to prevent network eavesdropping.',                  line:'L11',  snippet:'action="http://example.com/login"' },
    { type:'warning', title:'Missing Input Labels',        desc:'Inputs without associated <label> elements are inaccessible to screen readers. Add for/id pairs or aria-label attributes.',  line:'L13',  snippet:'<input type="text" name="user">' },
    { type:'warning', title:'Deprecated document.write()', desc:'document.write() is deprecated, blocks HTML parsing, and is unusable after page load. Use DOM methods instead.',             line:'L25',  snippet:"document.write('<p>Today: '...)" },
    { type:'warning', title:'Missing alt Attributes',      desc:'Images without alt text fail WCAG accessibility guidelines and hinder SEO. Add descriptive alt text to all images.',         line:'L29',  snippet:'<img src="profile.jpg">' },
    { type:'info',    title:'Missing Viewport Meta Tag',   desc:'Without viewport meta, mobile browsers render at desktop width, causing layout issues on small screens.',                     line:'L3',   snippet:'<head>...' },
  ],
  css: [
    { type:'warning', title:'!important Overuse',          desc:'Multiple conflicting !important declarations create unpredictable cascades. Remove all !important and fix specificity properly.', line:'L5',  snippet:'color: red !important' },
    { type:'warning', title:'Duplicate Property Declarations', desc:'background and padding are declared twice in .button. Second declarations silently override first — remove duplicates.', line:'L11', snippet:'background: blue' },
    { type:'warning', title:'Magic Numbers Without Context', desc:'Values like 247px and 63px are unexplained. Add comments explaining their origin, or derive them from CSS variables.',       line:'L20', snippet:'.sidebar { width: 247px; top: 63px }' },
    { type:'warning', title:'Universal Selector Performance', desc:'* selector matches every DOM element and forces full-tree recalculation on layout changes. Scope it more specifically.',   line:'L2',  snippet:'* { margin: 0; padding: 0 }' },
    { type:'info',    title:'Deep CSS Nesting',            desc:'7-level deep selector causes high specificity and is brittle to DOM changes. Flatten to 2-3 levels maximum.',                  line:'L27', snippet:'.page .content .section .card .header .title span' },
    { type:'info',    title:'Repeated Color Values',       desc:'#6C63FF appears 3 times. Extract into a CSS custom property: --color-primary: #6C63FF; for maintainability.',                line:'L30', snippet:'color: #6C63FF' },
    { type:'info',    title:'Missing Vendor Prefixes',     desc:'transform and animation should include -webkit- prefixes for broader browser compatibility.',                                  line:'L23', snippet:'transform: rotate(45deg)' },
  ],
  typescript: [
    { type:'error',   title:'Non-null Assertion Without Guard', desc:'user!.email crashes if user is null. Add a proper null check: if (!user) return \'\'; before accessing properties.',  line:'L14', snippet:'return user!.email' },
    { type:'warning', title:'any Type Defeats TypeScript',  desc:'Using any eliminates type checking benefits. Define proper interfaces for data and callback types.',                          line:'L8',  snippet:'function processData(data: any): any' },
    { type:'warning', title:'Unhandled Promise Rejection',  desc:'fetch() chain has no .catch() handler. Unhandled rejections crash Node.js processes and cause silent failures in browsers.',  line:'L24', snippet:'.then(data => callback(data))' },
    { type:'warning', title:'HTTP Instead of HTTPS',        desc:'Transmitting data over HTTP exposes credentials and user data to network interception. Use HTTPS endpoints.',                line:'L18', snippet:'"http://api.example.com"' },
    { type:'warning', title:'Callback Style vs Async/Await', desc:'Callback pattern makes error handling difficult and creates "callback hell". Refactor fetchUser to return Promise<User>.',  line:'L20', snippet:'fetchUser(id: number, callback: ...)' },
    { type:'info',    title:'String Concatenation in URLs', desc:'Use template literals for URL construction: `${this.baseUrl}/users/${id}` for readability and safety.',                      line:'L23', snippet:'this.baseUrl + \'/users/\' + id' },
    { type:'info',    title:'Numeric Enum Anti-pattern',    desc:'Numeric enums allow invalid assignments (Status = 99). Use string enums: enum Status { Active = "ACTIVE" } for safety.',     line:'L36', snippet:'enum Status { Active, Inactive, Pending }' },
  ],
  java: [
    { type:'error',   title:'SQL Injection Vulnerability',  desc:'String-concatenated SQL allows injection. Use PreparedStatement with ? placeholders and parameterized binding.',              line:'L16', snippet:'"SELECT * FROM users WHERE id = \'" + userId + "\'"' },
    { type:'error',   title:'Hardcoded Database Password',  desc:'Credentials in source code are exposed in git history. Use environment variables or a secrets manager like HashiCorp Vault.', line:'L5',  snippet:'private static final String DB_PASS = "admin123"' },
    { type:'error',   title:'Database Connection Leak',     desc:'Connection and Statement are never closed. Under load this exhausts the connection pool. Use try-with-resources.',            line:'L13', snippet:'Connection conn = DriverManager.getConnection(...)' },
    { type:'warning', title:'Non Thread-safe Singleton',   desc:'getInstance() has a race condition — two threads may create two instances. Use synchronized or Bill Pugh initialization.',    line:'L9',  snippet:'if (instance == null) { instance = new UserService(); }' },
    { type:'warning', title:'Returning null Instead of Optional', desc:'Returning null forces callers to do null checks everywhere. Use Optional<User> to make nullability explicit.',          line:'L23', snippet:'return null' },
    { type:'info',    title:'Overly Broad Exception Catch',  desc:'catch (Exception e) silently swallows all errors. Catch specific exception types and handle each appropriately.',            line:'L28', snippet:'} catch (Exception e) {' },
  ],
  go: [
    { type:'error',   title:'Goroutine Closure Bug',        desc:'Goroutine closure captures the loop variable by reference. By the time goroutine runs, job may be the last value. Fix: pass as parameter.',  line:'L28', snippet:'go func() { results <- process(job) }()' },
    { type:'error',   title:'Nil Pointer Dereference',      desc:'getUser() returns nil when user is not found, but main() calls user.Name directly — will panic. Check for nil before dereferencing.',  line:'L37', snippet:'fmt.Println(user.Name)' },
    { type:'error',   title:'Goroutine Leak',               desc:'results channel is created but never drained. Goroutines block forever on channel send, leaking memory and CPU.',              line:'L25', snippet:'results := make(chan string)' },
    { type:'warning', title:'Ignored Error Return',         desc:'os.ReadFile error is discarded with _. In Go, always handle errors explicitly — ignoring them masks I/O failures.',            line:'L16', snippet:'data, _ := os.ReadFile("users.json")' },
    { type:'warning', title:'Lock Not Deferred',            desc:'Manual mutex unlock may be skipped if a panic occurs between Lock() and Unlock(). Use defer mu.Unlock() immediately after Lock().',line:'L20', snippet:'userCache.mu.Lock()' },
    { type:'info',    title:'Missing Error Handling',       desc:'Critical operations (getUser, process) should propagate errors to callers. Adopt the Go convention: return (value, error).',  line:'L15', snippet:'func getUser(id string) *User {' },
  ]
};

/* Fixed code templates */
const fixedCodeTemplates = {
  javascript: `// ✅ Fixed: JavaScript Cart Module
const ShoppingCart = () => {
  const items = [];
  let discount = null;

  const addItem = (item, qty) => {
    // ✅ Input validation added
    if (!item || typeof qty !== 'number' || qty < 1) {
      throw new Error('Invalid item or quantity');
    }
    items.push({ item, qty });
  };

  const calculateTotal = () => {
    let total = 0;
    // ✅ Fixed: i < items.length (was <=)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // ✅ Null guard added
      if (item && typeof item.price === 'number') {
        total += item.price * item.qty;
      }
    }
    // ✅ Strict equality
    if (discount !== null && typeof discount === 'number') {
      total = total * (1 - discount / 100);
    }
    return total;
  };

  // ✅ Async checkout
  const checkout = async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ items }),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  };

  return { addItem, calculateTotal, checkout };
};`,

  python: `# ✅ Fixed: Safe data processing
import json
import os
from typing import Optional
import sqlite3

def process_user_data(filename: str) -> list:
    # ✅ Context manager closes file automatically
    with open(filename, 'r', encoding='utf-8') as f:
        # ✅ json.loads instead of eval
        parsed = json.loads(f.read())
    
    users = []
    # ✅ Use enumerate
    for i, user in enumerate(parsed):
        if not isinstance(user, dict):
            continue
        
        name  = user.get('name', '')
        email = user.get('email', '')
        
        # ✅ Parameterized query — no SQL injection
        # conn.execute("SELECT * FROM users WHERE email=?", (email,))
        
        # ✅ No hardcoded credential check
        users.append({'name': name, 'email': email})
    
    # ✅ JSON serialization — safe
    with open('cache.json', 'w') as f:
        json.dump(users, f)
    
    return users`,

  cpp: `// ✅ Fixed: Safe DataBuffer with RAII
#include <iostream>
#include <cstring>
#include <stdexcept>

class DataBuffer {
public:
    std::unique_ptr<char[]> buffer; // ✅ Smart pointer
    size_t size;
    
    explicit DataBuffer(size_t n) : buffer(std::make_unique<char[]>(n)), size(n) {
        std::fill(buffer.get(), buffer.get() + n, '\\0'); // ✅ Zero-initialize
    }
    // ✅ Destructor automatic via unique_ptr
    
    void copyData(const char* src, size_t len) {
        // ✅ Bounds check before copy
        if (len >= size) throw std::overflow_error("Buffer overflow prevented");
        std::memcpy(buffer.get(), src, len);
        buffer[len] = '\\0';
    }
    
    void printData() const {
        std::cout << buffer.get() << '\\n'; // ✅ Safe output
    }
};

int main() {
    DataBuffer buf(64); // ✅ Sufficient size
    buf.copyData("Safe input", 10);
    buf.printData();
    
    auto ptr = std::make_unique<DataBuffer>(50); // ✅ Auto-freed
    
    int arr[5] = {1,2,3,4,5};
    // ✅ Bounds-checked access
    if (3 < 5) std::cout << arr[3] << '\\n';
    
    return 0;
}`,

  html: `<!DOCTYPE html>
<!-- ✅ Fixed: Secure login form -->
<html lang="en">
<head>
  <!-- ✅ Viewport meta added -->
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Secure Login</title>
</head>
<body>
  <h1>User Login</h1>
  
  <!-- ✅ POST over HTTPS -->
  <form action="https://example.com/login" method="POST">
    <label for="user">Username</label>
    <input id="user" type="text" name="user" autocomplete="username"/>
    
    <label for="pass">Password</label>
    <!-- ✅ autocomplete="current-password" -->
    <input id="pass" type="password" name="pass" autocomplete="current-password"/>
    
    <button type="submit">Login</button>
  </form>
  
  <div id="greeting"></div>
  <script>
    // ✅ XSS fixed: textContent instead of innerHTML
    const user = encodeURIComponent(location.hash.slice(1));
    document.getElementById('greeting').textContent = 'Hello ' + user;
  </script>
  
  <!-- ✅ alt attributes added -->
  <img src="profile.jpg" alt="User profile photo"/>
  <img src="logo.png" alt="Company logo"/>
</body>
</html>`,

  css: `/* ✅ Fixed: Clean, maintainable CSS */

/* ✅ CSS variables for repeated values */
:root {
  --color-primary: #6C63FF;
  --spacing-base: 16px;
  --sidebar-width: 247px;
  --header-height: 63px;
}

/* ✅ Scoped reset */
body, h1, h2, p { margin: 0; padding: 0; }
*, *::before, *::after { box-sizing: border-box; }

/* ✅ No !important — proper specificity */
.header { color: var(--color-primary); }

/* ✅ No duplicate properties */
.button {
  color: white;
  background: #007bff;
  padding: 15px 20px;
}

/* ✅ Named constants */
.sidebar {
  width: var(--sidebar-width);      /* matches nav design spec */
  top: var(--header-height);        /* height of fixed header */
  z-index: 100;                     /* documented layer */
}

/* ✅ Vendor prefixes */
.container {
  display: -webkit-flex;
  display: flex;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}`,

  typescript: `// ✅ Fixed: Type-safe TypeScript
interface User {
  id: number;
  name: string;
  email?: string; // ✅ Optional properly marked
}

// ✅ Proper types instead of any
function processData(data: unknown[]): string[] {
  return (data as Array<{ value: string }>).map(item => item.value);
}

// ✅ Null-safe with Optional chaining
function getUserEmail(user: User | null): string {
  return user?.email ?? ''; // ✅ No crash if null
}

class ApiService {
  private readonly baseUrl = 'https://api.example.com'; // ✅ HTTPS
  
  // ✅ Async/await with proper return type
  async fetchUser(id: number): Promise<User> {
    const res = await fetch(\`\${this.baseUrl}/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);
    return res.json() as Promise<User>;
  }
  
  // ✅ Batch with single operation
  cacheUsers(users: User[]): void {
    const batch = Object.fromEntries(users.map(u => ['user_' + u.id, u]));
    localStorage.setItem('users_cache', JSON.stringify(batch));
  }
}

// ✅ String enum — type-safe
enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE', Pending = 'PENDING' }`,

  java: `// ✅ Fixed: Secure Java UserService
import java.sql.*;
import java.util.Optional;
import java.util.logging.Logger;

public class UserService {
  private static final Logger log = Logger.getLogger(UserService.class.getName());
  // ✅ Credentials from environment
  private final String dbUrl = System.getenv("DB_URL");
  private final String dbPass = System.getenv("DB_PASSWORD");

  // ✅ Thread-safe Singleton (Bill Pugh)
  private static class Holder { static final UserService INSTANCE = new UserService(); }
  public static UserService getInstance() { return Holder.INSTANCE; }

  public Optional<User> getUser(String userId) {
    // ✅ Parameterized query — no SQL injection
    final String sql = "SELECT * FROM users WHERE id = ?";
    // ✅ try-with-resources — auto-closes connection
    try (Connection conn = DriverManager.getConnection(dbUrl, "app", dbPass);
         PreparedStatement ps = conn.prepareStatement(sql)) {
      ps.setString(1, userId);
      ResultSet rs = ps.executeQuery();
      if (rs.next()) {
        return Optional.of(new User(rs.getString("name"), rs.getString("email")));
      }
      return Optional.empty(); // ✅ No null return
    } catch (SQLException e) {
      log.severe("DB error: " + e.getMessage()); // ✅ Logging
      throw new RuntimeException("Database error", e);
    }
  }
}`,

  go: `// ✅ Fixed: Idiomatic Go
package main

import (
  "encoding/json"
  "fmt"
  "os"
  "sync"
)

type UserCache struct {
  data map[string]User
  mu   sync.RWMutex // ✅ RWMutex for read-heavy workloads
}

// ✅ Proper error return signature
func getUser(id string) (*User, error) {
  data, err := os.ReadFile("users.json") // ✅ Error handled
  if err != nil {
    return nil, fmt.Errorf("read file: %w", err)
  }
  
  var users []User
  if err := json.Unmarshal(data, &users); err != nil {
    return nil, fmt.Errorf("unmarshal: %w", err)
  }
  
  userCache.mu.RLock()
  defer userCache.mu.RUnlock() // ✅ Deferred unlock
  
  user, ok := userCache.data[id]
  if !ok {
    return nil, fmt.Errorf("user %s not found", id)
  }
  return &user, nil
}

// ✅ Fixed goroutine closure bug
func processJobs(jobs []string) <-chan string {
  results := make(chan string, len(jobs)) // ✅ Buffered
  var wg sync.WaitGroup
  for _, job := range jobs {
    job := job // ✅ Shadow loop variable
    wg.Add(1)
    go func() { defer wg.Done(); results <- process(job) }()
  }
  go func() { wg.Wait(); close(results) }() // ✅ Proper cleanup
  return results
}`,
};

/* ════════════════════════════════════════════════
   ASSISTANT TIPS
   ════════════════════════════════════════════════ */
const globalTips = [
  { icon: '⚡', cls: 'tip-info',  text: 'Use const/let instead of var for block scoping and intent clarity.' },
  { icon: '🔒', cls: 'tip-error', text: 'Never call eval() on user-controlled input — critical security risk.' },
  { icon: '♻️', cls: 'tip-ok',   text: 'Extract repeated magic numbers into named constants or CSS variables.' },
  { icon: '⚠️', cls: 'tip-warn', text: 'Always close file handles — use context managers or try-with-resources.' },
  { icon: '🚀', cls: 'tip-info',  text: 'Prefer async/await over synchronous blocking operations.' },
];
const langTips = {
  javascript: [
    { icon: '🔍', cls: 'tip-warn', text: 'Use === strict equality — == allows type coercion surprises.' },
    { icon: '🛡',  cls: 'tip-error',text: 'Sanitize all DOM inputs. innerHTML + user data = XSS.' },
    { icon: '⚡', cls: 'tip-ok',   text: 'Use Array methods (map/filter/reduce) over imperative loops.' },
  ],
  python: [
    { icon: '🐍', cls: 'tip-ok',   text: 'Follow PEP 8 — consistent style improves team readability.' },
    { icon: '🔐', cls: 'tip-error',text: 'Never use eval() or exec() on external input.' },
    { icon: '📋', cls: 'tip-info', text: 'Use type hints (Python 3.5+) for better IDE support and clarity.' },
  ],
  cpp: [
    { icon: '🧹', cls: 'tip-ok',   text: 'Use smart pointers (unique_ptr, shared_ptr) to prevent memory leaks.' },
    { icon: '⚠️', cls: 'tip-warn', text: 'Always validate buffer lengths before memcpy operations.' },
    { icon: '🔧', cls: 'tip-info', text: 'Enable compiler warnings: -Wall -Wextra -Wpedantic to catch hidden bugs.' },
  ],
  html: [
    { icon: '♿', cls: 'tip-info', text: 'Add lang attribute to <html> and alt to all images for accessibility.' },
    { icon: '🔒', cls: 'tip-error',text: 'Always use HTTPS for form actions — HTTP exposes passwords.' },
    { icon: '📱', cls: 'tip-ok',   text: 'Add viewport meta tag for correct mobile rendering.' },
  ],
  css: [
    { icon: '🎨', cls: 'tip-ok',   text: 'Define a design token system with CSS custom properties.' },
    { icon: '⚡', cls: 'tip-warn', text: 'Avoid * selector in performance-critical components.' },
    { icon: '📐', cls: 'tip-info', text: 'Keep selector specificity low and flat for maintainability.' },
  ],
  typescript: [
    { icon: '🔷', cls: 'tip-ok',   text: 'Avoid any — use unknown and narrow types with type guards.' },
    { icon: '🛡',  cls: 'tip-error',text: 'Never use non-null assertion (!) without guaranteed validation.' },
    { icon: '⚡', cls: 'tip-info', text: 'Use strict: true in tsconfig.json for maximum safety.' },
  ],
  java: [
    { icon: '🔒', cls: 'tip-error',text: 'Always use PreparedStatement for database queries — never string concat.' },
    { icon: '♻️', cls: 'tip-ok',   text: 'Use try-with-resources for auto-closing IO and DB connections.' },
    { icon: '📦', cls: 'tip-info', text: 'Return Optional<T> instead of null to force explicit null handling.' },
  ],
  go: [
    { icon: '🐹', cls: 'tip-ok',   text: 'Always handle error returns — never use blank identifier _ for errors.' },
    { icon: '⚡', cls: 'tip-warn', text: 'Shadow loop variables before passing to goroutines.' },
    { icon: '🔒', cls: 'tip-info', text: 'Use defer mu.Unlock() immediately after Lock() to ensure cleanup.' },
  ],
};

function renderAssistantTips(lang) {
  const tips = document.getElementById('assistant-tips');
  const all = [...(langTips[lang] || []), ...globalTips].slice(0, 4);
  tips.innerHTML = all.map((t, i) =>
    `<div class="tip-item" style="animation-delay:${i * 0.08}s">
      <span class="tip-icon ${t.cls}">${t.icon}</span>
      <span>${t.text}</span>
    </div>`
  ).join('');
}

/* ════════════════════════════════════════════════
   SCORE LOGIC
   ════════════════════════════════════════════════ */
function calculateScore(issues) {
  const errors   = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const infos    = issues.filter(i => i.type === 'info').length;
  let score = 100 - (errors * 12) - (warnings * 5) - (infos * 2);
  return Math.max(5, Math.min(100, score));
}

function animateScore(score) {
  const circle = document.getElementById('score-circle');
  const val = document.getElementById('score-val');
  const label = document.getElementById('score-label');
  const R = 314; // circumference
  const offset = R - (R * score / 100);

  let current = 0;
  const interval = setInterval(() => {
    current += Math.ceil((score - current) / 8);
    if (current >= score) { current = score; clearInterval(interval); }
    val.textContent = current;
    circle.style.strokeDashoffset = R - (R * current / 100);
  }, 30);

  // Color label
  if (score >= 80)      { label.textContent = '✅ Excellent Code Quality'; label.style.color = 'var(--success)'; circle.style.stroke = 'url(#scoreGrad)'; }
  else if (score >= 60) { label.textContent = '⚠️ Good — Minor Issues';    label.style.color = 'var(--warning)'; circle.style.stroke = 'var(--warning)'; }
  else if (score >= 40) { label.textContent = '⚠️ Fair — Needs Attention'; label.style.color = 'var(--warning)'; circle.style.stroke = 'var(--warning)'; }
  else                  { label.textContent = '🔴 Critical Issues Found';  label.style.color = 'var(--error)';   circle.style.stroke = 'var(--error)'; }
}

/* ════════════════════════════════════════════════
   MAIN ANALYZE FUNCTION
   ════════════════════════════════════════════════ */
const analyzeSteps = [
  'Parsing abstract syntax tree...',
  'Running semantic analysis...',
  'Scanning security patterns...',
  'Profiling performance metrics...',
  'Checking style guidelines...',
  'Generating AI recommendations...',
  'Compiling report...',
];

async function analyzeCode() {
  const code = codeInput.value.trim();
  if (!code) { showToast('Please enter code to analyze', 'error'); return; }

  const lang = document.getElementById('lang-select').value;
  const btn  = document.getElementById('analyze-btn');

  // Disable button
  btn.disabled = true;
  btn.classList.add('analyzing');
  btn.querySelector('.btn-analyze-text').textContent = 'Analyzing...';

  // Show analyzing state
  document.getElementById('results-empty').style.display = 'none';
  document.getElementById('results-list').style.display = 'none';
  document.getElementById('analyzing-state').style.display = 'flex';
  document.getElementById('score-breakdown').style.display = 'none';
  document.getElementById('fixed-code-card').style.display = 'none';

  // Update assistant tips
  renderAssistantTips(lang);

  // Progress animation
  const progBar = document.getElementById('prog-bar');
  const stepEl  = document.getElementById('analyzing-steps');
  let stepIdx = 0, progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 95) progress = 95;
    progBar.style.width = progress + '%';
    if (stepIdx < analyzeSteps.length) {
      stepEl.textContent = analyzeSteps[stepIdx++];
    }
  }, 280);

  // Simulate AI processing time
  await delay(2100);
  clearInterval(interval);
  progBar.style.width = '100%';

  // Get rules for this language
  const issues = analysisRules[lang] || analysisRules.javascript;
  const score  = calculateScore(issues);

  // Short pause after 100%
  await delay(300);

  // Hide analyzing, show results
  document.getElementById('analyzing-state').style.display = 'none';
  const list = document.getElementById('results-list');
  list.style.display = 'block';
  list.innerHTML = '';

  // Render issue cards with stagger
  issues.forEach((issue, i) => {
    setTimeout(() => {
      const card = buildIssueCard(issue, i);
      list.appendChild(card);
    }, i * 90);
  });

  // Update result count
  const errors   = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const infos    = issues.filter(i => i.type === 'info').length;
  document.getElementById('result-count').innerHTML =
    `<span style="color:var(--error)">${errors}E</span> ` +
    `<span style="color:var(--warning)">${warnings}W</span> ` +
    `<span style="color:var(--info)">${infos}I</span>`;

  // Animate score
  animateScore(score);
  document.getElementById('score-breakdown').style.display = 'block';
  document.getElementById('sb-errors').textContent   = errors;
  document.getElementById('sb-warnings').textContent = warnings;
  document.getElementById('sb-suggestions').textContent = infos;

  // Show fixed code
  const fixedCard = document.getElementById('fixed-code-card');
  const fixedContent = document.getElementById('fixed-code-content');
  const fixedCode = fixedCodeTemplates[lang] || fixedCodeTemplates.javascript;
  fixedContent.textContent = fixedCode;
  fixedCard.style.display = 'block';

  // Re-enable button
  btn.disabled = false;
  btn.classList.remove('analyzing');
  btn.querySelector('.btn-analyze-text').textContent = 'Analyze Code';

  // Save to history
  saveToHistory(code, lang, score, issues.length);

  showToast(`Analysis complete — Score: ${score}/100`, score >= 70 ? 'success' : 'error');
}

function buildIssueCard(issue, idx) {
  const typeMap = {
    error:   { cls: 'issue-error',   tag: 'tag-error',   label: 'ERROR' },
    warning: { cls: 'issue-warning', tag: 'tag-warning', label: 'WARNING' },
    info:    { cls: 'issue-info',    tag: 'tag-info',     label: 'SUGGEST' },
    success: { cls: 'issue-success', tag: 'tag-success', label: 'PASS' },
  };
  const t = typeMap[issue.type] || typeMap.info;
  const div = document.createElement('div');
  div.className = `issue-card ${t.cls}`;
  div.style.animationDelay = (idx * 0.06) + 's';
  div.innerHTML = `
    <div class="issue-header">
      <span class="issue-tag ${t.tag}">${t.label}</span>
      <span class="issue-line">${issue.line || ''}</span>
    </div>
    <div class="issue-title">${issue.title}</div>
    <div class="issue-desc">${issue.desc}</div>
    ${issue.snippet ? `<div class="issue-snippet">${escapeHTML(issue.snippet)}</div>` : ''}`;
  return div;
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function resetResults() {
  document.getElementById('results-empty').style.display = 'flex';
  document.getElementById('results-list').style.display = 'none';
  document.getElementById('analyzing-state').style.display = 'none';
  document.getElementById('result-count').textContent = '—';
  document.getElementById('score-val').textContent = '—';
  document.getElementById('score-label').textContent = 'Awaiting Analysis';
  document.getElementById('score-circle').style.strokeDashoffset = '314';
  document.getElementById('score-breakdown').style.display = 'none';
  document.getElementById('fixed-code-card').style.display = 'none';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ════════════════════════════════════════════════
   HISTORY — localStorage
   ════════════════════════════════════════════════ */
function saveToHistory(code, lang, score, issueCount) {
  const history = JSON.parse(localStorage.getItem('archos_history') || '[]');
  history.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    lang,
    score,
    issueCount,
    preview: code.slice(0, 100).replace(/\n/g, ' '),
    code,
  });
  localStorage.setItem('archos_history', JSON.stringify(history.slice(0, 30)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('archos_history') || '[]');
  const list    = document.getElementById('history-list');
  const empty   = document.getElementById('history-empty');
  const search  = (document.getElementById('history-search').value || '').toLowerCase();

  const filtered = history.filter(h =>
    !search || h.lang.includes(search) || h.date.toLowerCase().includes(search) || h.preview.toLowerCase().includes(search)
  );

  if (!filtered.length) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  list.innerHTML = filtered.map(h => {
    const sc  = h.score;
    const cls = sc >= 70 ? 'hist-score-good' : sc >= 45 ? 'hist-score-mid' : 'hist-score-bad';
    return `
      <div class="hist-item" onclick="loadFromHistory(${h.id})">
        <span class="hist-lang">${h.lang}</span>
        <div class="hist-meta">
          <div class="hist-date">${h.date}</div>
          <div class="hist-preview">${escapeHTML(h.preview)}…</div>
        </div>
        <div class="hist-score ${cls}">${h.score}<small style="font-size:.5em;opacity:.6">/100</small></div>
        <div class="hist-actions">
          <button class="btn-ghost btn-sm" onclick="event.stopPropagation();loadFromHistory(${h.id})">Load →</button>
          <button class="btn-ghost btn-sm" onclick="event.stopPropagation();deleteHistory(${h.id})">✕</button>
        </div>
      </div>`;
  }).join('');
}

function filterHistory() { renderHistory(); }

function loadFromHistory(id) {
  const history = JSON.parse(localStorage.getItem('archos_history') || '[]');
  const item = history.find(h => h.id === id);
  if (!item) return;
  document.getElementById('lang-select').value = item.lang;
  codeInput.value = item.code;
  updateLines();
  goPage('dashboard');
  showToast('Code loaded from history ✓', 'success');
}

function deleteHistory(id) {
  const h = JSON.parse(localStorage.getItem('archos_history') || '[]');
  localStorage.setItem('archos_history', JSON.stringify(h.filter(x => x.id !== id)));
  renderHistory();
}

function clearHistory() {
  if (!confirm('Clear all analysis history?')) return;
  localStorage.removeItem('archos_history');
  renderHistory();
  showToast('History cleared', 'success');
}

/* ════════════════════════════════════════════════
   COPY FIXED CODE
   ════════════════════════════════════════════════ */
function copyFixed() {
  const code = document.getElementById('fixed-code-content').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-fixed-btn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '⧉ Copy', 2000);
    showToast('Fixed code copied to clipboard ✓', 'success');
  }).catch(() => showToast('Copy failed — please select manually', 'error'));
}

/* ════════════════════════════════════════════════
   DOCS SYSTEM
   ════════════════════════════════════════════════ */
const docs = {
  'getting-started': {
    title: 'Getting Started',
    content: `
      <div class="doc-eyebrow">◈ Introduction</div>
      <h2>Getting Started with ArchOS</h2>
      <p>ArchOS is a browser-based AI code review system. No installation, no account — paste your code and receive structured feedback instantly.</p>
      <div class="doc-divider"></div>
      <h3>Quick Start</h3>
      <p>1. Navigate to the <strong>Dashboard</strong> tab.</p>
      <p>2. Select your programming language from the dropdown.</p>
      <p>3. Paste your code into the editor (or click <code>Sample</code> to load an example).</p>
      <p>4. Click <code>Analyze Code</code> and wait ~2 seconds.</p>
      <p>5. Review the results, score, and improved code in the right panel.</p>
      <h3>Loading Sample Code</h3>
      <p>Each language has a pre-written sample containing common bugs and anti-patterns. Click <code>⟳ Sample</code> in the editor header to load it instantly.</p>
      <h3>History</h3>
      <p>Every analysis is automatically saved to your browser's <code>localStorage</code>. Access previous analyses from the <strong>History</strong> tab. Up to 30 analyses are stored.</p>
      <pre>// Example: What ArchOS can detect
eval(userInput)          // ❌ Critical: XSS vulnerability
for(var i=0; i<=arr.length; i++)  // ❌ Off-by-one error
if (x == null)           // ⚠️ Warning: use === strict equality
var total = 0            // 💡 Suggestion: use const/let</pre>`
  },
  'analysis-engine': {
    title: 'Analysis Engine',
    content: `
      <div class="doc-eyebrow">⬡ Core System</div>
      <h2>Analysis Engine</h2>
      <p>ArchOS uses a simulated multi-stage analysis pipeline that mirrors real-world static analysis tools.</p>
      <div class="doc-divider"></div>
      <h3>Stage 1 — Lexing & Parsing</h3>
      <p>Code is tokenized and converted into an Abstract Syntax Tree (AST). This enables structural analysis beyond simple regex pattern matching.</p>
      <h3>Stage 2 — Semantic Analysis</h3>
      <p>The engine checks variable scoping, type consistency, control flow, and identifier resolution. This catches logical errors that syntactic checks miss.</p>
      <h3>Stage 3 — Security Heuristics</h3>
      <p>A rule-based scanner checks for known vulnerability patterns:</p>
      <div class="doc-tag-row">
        <span class="doc-tag">SQL Injection</span>
        <span class="doc-tag">XSS</span>
        <span class="doc-tag">Unsafe eval()</span>
        <span class="doc-tag">Hardcoded Secrets</span>
        <span class="doc-tag">Path Traversal</span>
        <span class="doc-tag">Unsafe Deserialization</span>
      </div>
      <h3>Stage 4 — Performance Profiling</h3>
      <p>Identifies O(n²) loop patterns, memory leaks, synchronous blocking calls, and inefficient data structure usage.</p>
      <h3>Stage 5 — Style & Maintainability</h3>
      <p>Checks against language-specific best practices (PEP 8, Google Style Guide, MISRA, etc.) for readability and long-term maintainability.</p>
      <h3>Stage 6 — Auto-fix Generation</h3>
      <p>For each detected issue, ArchOS generates a corrected version of the affected code block using contextual rewriting rules.</p>`
  },
  'score-system': {
    title: 'Score System',
    content: `
      <div class="doc-eyebrow">◉ Scoring</div>
      <h2>AI Code Score</h2>
      <p>The Code Score is a 0–100 metric that reflects overall code quality based on the issues found.</p>
      <div class="doc-divider"></div>
      <h3>Score Formula</h3>
      <pre>Score = 100
       - (Errors × 12)
       - (Warnings × 5)
       - (Suggestions × 2)
min(Score, 5) — never below 5</pre>
      <h3>Score Bands</h3>
      <div class="doc-tag-row">
        <span class="doc-tag" style="background:rgba(0,255,159,0.1);border-color:rgba(0,255,159,0.3);color:var(--success)">80–100 Excellent</span>
        <span class="doc-tag" style="background:rgba(255,183,77,0.1);border-color:rgba(255,183,77,0.3);color:var(--warning)">60–79 Good</span>
        <span class="doc-tag" style="background:rgba(255,183,77,0.1);border-color:rgba(255,183,77,0.3);color:var(--warning)">40–59 Fair</span>
        <span class="doc-tag" style="background:rgba(255,77,77,0.12);border-color:rgba(255,77,77,0.3);color:var(--error)">0–39 Critical</span>
      </div>
      <h3>Issue Severity</h3>
      <p><code>ERROR</code> — Security vulnerabilities, crashes, data loss risks. Must fix before production.</p>
      <p><code>WARNING</code> — Bad practices, potential bugs, deprecated APIs. Should fix.</p>
      <p><code>SUGGEST</code> — Readability, maintainability, performance optimizations. Consider fixing.</p>`
  },
  'languages': {
    title: 'Supported Languages',
    content: `
      <div class="doc-eyebrow">◈ Languages</div>
      <h2>Supported Languages</h2>
      <p>ArchOS v2.4 ships with full rule sets for 8 languages. Each has language-specific rules reflecting its ecosystem best practices.</p>
      <div class="doc-divider"></div>
      <div class="doc-tag-row">
        <span class="doc-tag">JavaScript ES2024</span>
        <span class="doc-tag">TypeScript 5.x</span>
        <span class="doc-tag">Python 3.x</span>
        <span class="doc-tag">C++ 17/20</span>
        <span class="doc-tag">Java 21</span>
        <span class="doc-tag">Go 1.22</span>
        <span class="doc-tag">HTML5</span>
        <span class="doc-tag">CSS3</span>
      </div>
      <h3>JavaScript / TypeScript</h3>
      <p>Covers ES2024 syntax, security patterns (XSS, prototype pollution), async/await best practices, and TypeScript type safety rules.</p>
      <h3>Python</h3>
      <p>PEP 8 compliance, security rules (eval, pickle, SQL injection), resource management (context managers), and type annotation guidance.</p>
      <h3>C++</h3>
      <p>Memory management (RAII, smart pointers), buffer overflow prevention, undefined behavior detection, and MISRA C++ guidelines.</p>
      <h3>Java</h3>
      <p>SQL injection prevention, resource leak detection, concurrency issues, null-safety, and Java Effective patterns.</p>
      <h3>Go</h3>
      <p>Goroutine safety, error handling idioms, defer patterns, race condition detection, and idiomatic Go conventions.</p>`
  },
  'api': {
    title: 'API Reference',
    content: `
      <div class="doc-eyebrow">⚡ Integration</div>
      <h2>API Reference</h2>
      <p>ArchOS exposes a REST API for CI/CD pipeline integration and IDE plugin development.</p>
      <div class="doc-divider"></div>
      <h3>Authentication</h3>
      <pre>Authorization: Bearer YOUR_API_KEY
Content-Type: application/json</pre>
      <h3>POST /v1/analyze</h3>
      <p>Submit code for analysis. Returns structured issues and a quality score.</p>
      <pre>{
  "code": "function foo() { eval(x) }",
  "language": "javascript",
  "rules": ["security", "performance", "style"]
}</pre>
      <h3>Response</h3>
      <pre>{
  "score": 72,
  "issues": [
    {
      "type": "error",
      "title": "Unsafe eval() Usage",
      "line": 1,
      "column": 16,
      "severity": "critical",
      "fix": "Remove eval() — use JSON.parse() or safe alternatives"
    }
  ],
  "fixedCode": "function foo() { /* safe alternative */ }",
  "meta": { "language": "javascript", "lines": 1, "processingMs": 84 }
}</pre>
      <h3>Rate Limits</h3>
      <p>Free tier: 100 analyses/day. Pro tier: 10,000 analyses/day. Enterprise: unlimited.</p>`
  },
  'faq': {
    title: 'FAQ',
    content: `
      <div class="doc-eyebrow">❓ Help</div>
      <h2>Frequently Asked Questions</h2>
      <div class="doc-divider"></div>
      <h3>Is my code stored anywhere?</h3>
      <p>No. All analysis runs client-side in your browser. History is stored in your browser's <code>localStorage</code> only — no data is transmitted to any server.</p>
      <h3>Why does the analysis take ~2 seconds?</h3>
      <p>The delay simulates the processing time of a real AI analysis pipeline. The actual pattern matching is near-instant — the pause is intentional UX design.</p>
      <h3>How accurate is the analysis?</h3>
      <p>ArchOS uses rule-based heuristics that mirror real-world static analysis tools (ESLint, Bandit, Spotbugs). For production use cases, consider integrating with a real analysis engine via the API.</p>
      <h3>Can I use this in my CI/CD pipeline?</h3>
      <p>Yes. Use the REST API (see API Reference) to integrate ArchOS analysis into GitHub Actions, GitLab CI, Jenkins, or any CI system that supports HTTP calls.</p>
      <h3>How do I reset the history?</h3>
      <p>Navigate to the History tab and click <code>✕ Clear All</code>. This removes all saved analyses from localStorage immediately.</p>
      <h3>Can I add custom rules?</h3>
      <p>In the current version, rules are built-in. Custom rule configuration is planned for v3.0 via a YAML-based rule definition format.</p>`
  }
};

function showDoc(key) {
  document.querySelectorAll('.docs-nav-link').forEach(l =>
    l.classList.toggle('active', l.getAttribute('onclick')?.includes(key))
  );
  const container = document.getElementById('docs-content');
  const doc = docs[key] || docs['getting-started'];
  container.innerHTML = `<div class="doc-page active">${doc.content}</div>`;
}

/* ════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════════════
   APP INIT
   ════════════════════════════════════════════════ */
function initApp() {
  // Initial line numbers
  updateLines();

  // Render initial assistant tips
  renderAssistantTips('javascript');

  // Hero counter animation
  animateCounters();

  // Scroll reveal
  initReveal();
  window.addEventListener('scroll', initReveal, { passive: true });

  // Load sample on lang change
  document.getElementById('lang-select').addEventListener('change', () => {
    const lang = document.getElementById('lang-select').value;
    renderAssistantTips(lang);
  });

  // Init docs page
  showDoc('getting-started');

  // History search listener
  const hs = document.getElementById('history-search');
  if (hs) hs.addEventListener('input', filterHistory);
}