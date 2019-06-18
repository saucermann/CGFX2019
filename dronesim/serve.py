#!/usr/bin/python3

import cherrypy
from cherrypy.lib import static
from jinja2 import Environment, FileSystemLoader
import os
import requests

DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_FOLDER = os.path.join(DIR, 'templates')
INDEX = 'index.html'
env = Environment(loader=FileSystemLoader(TEMPLATES_FOLDER))

class Server(object):
    @cherrypy.expose
    def index(self):
        t = env.get_template(INDEX)
        return t.render()


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'public'
        },
        '/favicon.ico':
        {
            'tools.staticfile.on': True,
            'tools.staticfile.filename': '/static/assets/facebook.ico'
        }
    }

    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 8080,
    })

    cherrypy.quickstart(Server(), '/', conf)
