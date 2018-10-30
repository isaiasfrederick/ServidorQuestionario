# -*- coding: utf-8 -*-

import pycorenlp
import requests
import socket
import pywsd
import nltk
import json
import sys
import os

from pywsd.lesk import cosine_lesk
from nltk.corpus import wordnet as wn

from flask import Flask, render_template, request, send_from_directory
app = Flask(__name__)


def preencheu_questionario(userID):
    return False

def gerar_erro(mensagem):
    return\
        {
            'retorno' : 'erro',
            'mensagem' : mensagem
        }

# consulta o facebook e checa se a chave e valida
def validar_access_token(access_token):
    url = 'https://graph.facebook.com/oauth/access_token_info?access_token=' + access_token
    resultado = requests.get(url).json()

    print('Executando a consulta: ' + url)

    try:
        if 'expires_in' in resultado:
            print('O accessToken pesquisado existe para o Facebook!');
            return True
        else:
            return False
    except:
        return False


def gerar_questionario():
    questionario = { }
    total_questoes = 4

    questionario['id'] = 'mhnf5jmx'
    questionario['exercicios'] = [ ]
    questionario['total_questoes'] = str(total_questoes)

    for questao in range(1, total_questoes + 1):
        retorno = { }

        if questao < 1000:
            retorno['questionario'] = questionario['id']
            retorno['total_questoes'] = questionario['total_questoes']
            retorno['questao'] = str(questao)
            retorno['enunciado'] = 'Para a sentença <S> qual o significado mais indicado para o termo <T>?'
            retorno['termo'] = 'sense'
            retorno['sentenca'] = 'he has a sense for animals'
            retorno['alternativas'] = [
                    'a general conscious awareness',
                    'the meaning of a word or expression',
                    'the way in which a word or expression or situation can be interpreted',
                    'the faculty through which the external world is apprehended',
                    'sound practical judgment',
                    'a natural appreciation or ability, perceive by a physical sensation'
            ]

        questionario['exercicios'].append(retorno)

    return questionario

@app.route('/<string:page_name>/')
def render_static(page_name):
    return render_template('%s.html' % page_name)


@app.route('/imgs/<path:path>')
def send_img(path):
    return send_from_directory('imgs',path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js',path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css',path)

@app.route('/api')
def enviar_questionario():
    questao = int(request.args.get('questao'))

    accessToken = request.args.get('accessToken')

    if validar_access_token(accessToken):
        print('O accessToken para este usuario: VALIDO!');
        userID = int(request.args.get('userID'))
        questionario = gerar_questionario()

        return json.dumps\
        ({
            'retorno': 'ok',
            'questao' : questionario['exercicios'][questao - 1]
        })
    else:
        # se ja preencheu o formulario
        return json.dumps({'retorno': 'erro'})

@app.route('/submeter', methods=['POST'])
def submeter():
    gabarito = [int(e) for e in json.loads(request.form.get('gabarito'))]
    accessToken = request.form.get('accessToken')
    userID = request.form.get('userID')
    idQuestionario = request.form.get('idQuestionario')

    #if -1 in gabarito or gabarito.__len__() < total_questoes:

    if gabarito and idQuestionario and accessToken and userID:
        if validar_access_token(accessToken):
            if not preencheu_questionario(userID):
                return json.dumps({'retorno': 'ok'})
            else:
                return json.dumps({'retorno': 'erro'})
        else:
            print('O accessToken para este usuario: INVALIDO!');
            return json.dumps({'retorno': 'erro'})
    else:
        return json.dumps({'retorno': 'erro'})
