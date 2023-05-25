from flask import Flask

app = Flask("paddle-pulse")

@app.route("/")
def index():
    return "Welcome to the Ping Pong Hit Detection App!"

if __name__ == "__main__":
    app.run(debug=True)
