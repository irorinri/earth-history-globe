from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse
import mimetypes


mimetypes.add_type("text/javascript; charset=utf-8", ".js")
mimetypes.add_type("application/json; charset=utf-8", ".json")
mimetypes.add_type("application/geo+json; charset=utf-8", ".geojson")
mimetypes.add_type("text/css; charset=utf-8", ".css")


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".geojson": "application/geo+json; charset=utf-8",
        ".css": "text/css; charset=utf-8",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()

    with ThreadingHTTPServer((args.bind, args.port), Handler) as server:
        print(f"Serving at http://{args.bind}:{args.port}/")
        server.serve_forever()


if __name__ == "__main__":
    main()
