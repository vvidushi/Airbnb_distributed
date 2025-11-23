# 📸 Screenshot Guide for Lab 2 Report

This guide helps you capture all required screenshots for the Lab 2 submission.

---

## Required Screenshots Checklist

### Part 1: Docker & Kubernetes (5 screenshots)

- [ ] **Screenshot 1**: Docker images
  ```bash
  docker images | grep airbnb
  ```
  
- [ ] **Screenshot 2**: Running containers
  ```bash
  docker ps
  ```

- [ ] **Screenshot 3**: Kubernetes pods
  ```bash
  kubectl get pods -n airbnb-lab
  ```

- [ ] **Screenshot 4**: Kubernetes services
  ```bash
  kubectl get svc -n airbnb-lab
  ```

- [ ] **Screenshot 5**: Application running (browser)
  - Navigate to http://localhost:3000
  - Show the working application

### Part 2: Kafka (4 screenshots)

- [ ] **Screenshot 6**: Kafka topics
  ```bash
  kubectl exec -it kafka-0 -n airbnb-lab -- kafka-topics --list --bootstrap-server localhost:9092
  ```

- [ ] **Screenshot 7**: Producer service logs
  ```bash
  kubectl logs -f deployment/kafka-producer -n airbnb-lab
  ```
  - Show a booking request being published

- [ ] **Screenshot 8**: Consumer service logs
  ```bash
  kubectl logs -f deployment/kafka-consumer -n airbnb-lab
  ```
  - Show event being consumed and processed

- [ ] **Screenshot 9**: Kafka message flow diagram
  - Draw.io or similar tool showing:
    - Frontend → Producer → Kafka → Consumer → Database

### Part 3: MongoDB (3 screenshots)

- [ ] **Screenshot 10**: MongoDB collections
  ```bash
  kubectl exec -it mongodb-0 -n airbnb-lab -- mongosh
  > show dbs
  > use airbnb_sessions
  > show collections
  ```

- [ ] **Screenshot 11**: Session data in MongoDB
  ```bash
  > db.sessions.findOne()
  ```

- [ ] **Screenshot 12**: Encrypted password
  ```bash
  > db.users.findOne({ email: "traveler@test.com" }, { password_hash: 1 })
  ```

### Part 4: Redux (5 screenshots)

- [ ] **Screenshot 13**: Redux DevTools - Store overview
  - Open browser DevTools → Redux tab
  - Show complete state tree

- [ ] **Screenshot 14**: Redux DevTools - Auth state
  - Navigate to `state.auth`
  - Show user object and authentication status

- [ ] **Screenshot 15**: Redux DevTools - Properties state
  - Navigate to `state.properties`
  - Show property list and search filters

- [ ] **Screenshot 16**: Redux DevTools - Bookings state
  - Navigate to `state.bookings`
  - Show bookings array and favorites

- [ ] **Screenshot 17**: Redux DevTools - Action history
  - Click on "Action" tab
  - Show sequence of dispatched actions

### Part 5: JMeter (6 screenshots)

- [ ] **Screenshot 18**: JMeter Summary Report (100 users)
  - Open HTML report: `jmeter/reports/report-100users-*/index.html`
  - Show dashboard overview

- [ ] **Screenshot 19**: JMeter Summary Report (500 users)
  - Open HTML report: `jmeter/reports/report-500users-*/index.html`
  - Show dashboard overview

- [ ] **Screenshot 20**: Response time graph
  - From JMeter HTML report
  - Show "Response Times Over Time" graph

- [ ] **Screenshot 21**: Throughput graph
  - From JMeter HTML report
  - Show "Transactions Per Second" graph

- [ ] **Screenshot 22**: Python analysis graph
  - Run: `python scripts/analyze-results.py`
  - Save the generated PNG

- [ ] **Screenshot 23**: JMeter test execution
  ```bash
  ./scripts/run-load-tests.sh
  ```
  - Show terminal output during test run

---

## How to Capture Screenshots

### macOS
```bash
# Full screen
Cmd + Shift + 3

# Selection
Cmd + Shift + 4

# Window
Cmd + Shift + 4, then Space
```

### Linux
```bash
# Full screen
Print Screen

# Selection
Shift + Print Screen

# Using gnome-screenshot
gnome-screenshot -a
```

### Windows
```bash
# Full screen
Windows + Print Screen

# Snipping Tool
Windows + Shift + S
```

---

## Screenshot Organization

Create a `screenshots/` folder in your project:

```
screenshots/
├── 01-docker-images.png
├── 02-docker-containers.png
├── 03-k8s-pods.png
├── 04-k8s-services.png
├── 05-app-running.png
├── 06-kafka-topics.png
├── 07-producer-logs.png
├── 08-consumer-logs.png
├── 09-kafka-flow-diagram.png
├── 10-mongodb-collections.png
├── 11-session-data.png
├── 12-encrypted-password.png
├── 13-redux-store.png
├── 14-redux-auth.png
├── 15-redux-properties.png
├── 16-redux-bookings.png
├── 17-redux-actions.png
├── 18-jmeter-100users.png
├── 19-jmeter-500users.png
├── 20-response-time-graph.png
├── 21-throughput-graph.png
├── 22-python-analysis.png
└── 23-jmeter-execution.png
```

---

## Tips for Good Screenshots

1. **High Resolution**: Use at least 1920x1080
2. **Clear Text**: Ensure terminal text is readable
3. **Crop Appropriately**: Remove unnecessary UI elements
4. **Highlight Important Parts**: Use arrows or boxes
5. **Include Context**: Show relevant parts of the screen
6. **Dark Mode**: Use dark mode for better readability
7. **Consistent Naming**: Use numbered prefixes

---

## Embedding in Report

### Markdown
```markdown
![Docker Images](screenshots/01-docker-images.png)
```

### HTML (for more control)
```html
<img src="screenshots/01-docker-images.png" alt="Docker Images" width="800">
```

---

## Quick Capture Script

Create `capture-screenshots.sh`:

```bash
#!/bin/bash

mkdir -p screenshots

echo "📸 Screenshot Capture Guide"
echo "=========================="
echo ""
echo "Press ENTER after capturing each screenshot"
echo ""

screenshots=(
  "Docker images"
  "Running containers"
  "Kubernetes pods"
  "Kubernetes services"
  "Application running"
  "Kafka topics"
  "Producer logs"
  "Consumer logs"
  "MongoDB collections"
  "Redux DevTools"
  "JMeter results"
)

for i in "${!screenshots[@]}"; do
  num=$((i + 1))
  echo "[$num/${#screenshots[@]}] Capture: ${screenshots[$i]}"
  read -p "Press ENTER when done..."
done

echo ""
echo "✅ All screenshots captured!"
echo "   Check the screenshots/ folder"
```

---

## Verification Checklist

Before submitting:

- [ ] All 23 screenshots captured
- [ ] Screenshots are clear and readable
- [ ] File names are consistent
- [ ] Screenshots show expected results
- [ ] Screenshots are referenced in report
- [ ] Screenshots are properly sized (not too large)
- [ ] Added captions/descriptions in report

---

## Example Screenshot Captions

**Good caption:**
> Figure 1: Docker images showing frontend (25MB), backend (180MB), and ai-agent (450MB) successfully built with 'latest' tag.

**Bad caption:**
> Docker images

---

## Common Mistakes to Avoid

❌ **Don't**:
- Capture screenshots with low resolution
- Include sensitive data (API keys, passwords)
- Use generic filenames (screenshot1.png)
- Forget to show important details
- Take screenshots of error screens without context

✅ **Do**:
- Use descriptive filenames
- Show successful operations
- Include relevant logs and output
- Add annotations if needed
- Verify screenshots before final submission

---

## Need Help?

If you're missing any screenshots, refer to:
- **[LAB2_REPORT.md](./LAB2_REPORT.md)** - See what each screenshot should contain
- **[DOCKER_KUBERNETES.md](./DOCKER_KUBERNETES.md)** - Commands to run services
- **[KAFKA_SETUP.md](./KAFKA_SETUP.md)** - Kafka verification commands
- **[JMETER_TESTING.md](./JMETER_TESTING.md)** - How to run and view tests

---

**Happy Screenshot Hunting! 📸**

