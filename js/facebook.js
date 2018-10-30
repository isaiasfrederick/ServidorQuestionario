$alternativa_marcada = -1;
$total_questoes = 0;
$questao_corrente = 1;

$carregar_questao = function(numero_questao) {
	$questao_corrente = numero_questao;
	$.ajax({
		type: 'GET',
		url: '/api',
		dataType: 'json',
		success: function(data) {
			if (data['retorno'] == 'ok'){ $.carregar(data['questao']); }
			else if (data['retorno'] == 'erro')
			{
				$.novaSessao();
			}
		},
		data: {
			'questao': numero_questao,
			'userID': localStorage.getItem('userID'),
			'accessToken': localStorage.getItem('accessToken')
		},
		async: true
	});
}

$submeter = function(args) {
	$.post(
		'/submeter',
		{
			'userID' : args.getItem('userID'),
			'accessToken' : args.getItem('accessToken'),
			'idQuestionario' : 'NA',
			'gabarito' : args.getItem('gabarito')
		},
		function(response){
			retorno = jQuery.parseJSON(response);
			if (retorno.retorno == 'ok')
				$.concluir();
			else
				alert('Um erro foi detectado: ' + retorno.mensagem);
		}
	);
}

$.concluir =  function() {
	localStorage.clear();
	$('#nome_agradecimento').html($('#nome_visitante').text());
	$.exibirPaineis(['#div_concluido']);
}

$.exibirJanelaVisitante = function()
{
	$('#avatar').prop('src', '../imgs/desconhecido.jpg');
	$('#nome_visitante').html('visitante');	
}

$.exibirPaineis =  function(seletores) {
	$("#principal_conteudo").hide();
	$("#div_carregando").hide();
	$("#div_concluido").hide();
	$("#div_acessorepetido").hide();
	$("#div_login").hide();
	$("#div_deslogado").hide();

	$.each(seletores, function(i, v) {
		$(v).show();
	});
}

$.exibirTelaLogin = function() {
	$.exibirJanelaVisitante();
	$.exibirPaineis(['#div_login']);
}

$.checarRespostas =  function(respostas) {
	$retorno = true;
	$.each(JSON.parse(respostas), function(i, v) {
		if (v === -1) {
			$retorno = false;
			return $retorno;
		}
	});
	return $retorno;
}

$.novaSessao = function()
{
	localStorage.clear();					
	location.reload();
}

$.consultarFacebook = function(idFacebook, accessToken)
{
	$.ajax({
		type: 'GET',
		url: 'https://graph.facebook.com/v2.11/me/',
		dataType: 'json',
		success: function(data) {
			$('#nome_visitante').html(data['name']);
			$('#avatar').prop('src', data['picture']['data']['url']);
		},
		data: {
			'access_token': accessToken,
			'fields': 'name,email,id,picture'
		},
		async: true
	});
}

$.carregar = function(data) {
	$alternativa_marcada = -1;
	$questao_corrente = data['questao'];
	
	$('#label_exercicio').html('Exercicio ' + $questao_corrente);
	$('#sentenca').html('"' + data['sentenca'] + '"');
	$('#termo_analisado').html(data['termo']);

	$("#principal_conteudo").show();
	$("#div_carregando").hide();	
		
	$item = '<button type="button" class="list-group-item" id="alternativa-NUMERO" value="VALUE"></button>';

	$('#alternativas').empty();

	$.each(data['alternativas'], function(i, v) {
		$num_questao = i + 1;
		$nodo = $item.replace("NUMERO", $num_questao);
		$nodo = $nodo.replace("VALUE", $num_questao);
		$badge = '<span class="badge">'+$num_questao+'</span>'
		$label_alternativa = '<b>' + $badge + '</b>   <span style="margin-left:10px">' + v + '</span>';
		$nodo = $nodo.replace('><', '>' + $label_alternativa + '<');
		$('#alternativas').append($nodo);
	});

	$total_questoes = parseInt(data['total_questoes']);
	if (localStorage.getItem('gabarito') === null) {
		localStorage.setItem('gabarito', JSON.stringify(Array($total_questoes).fill(-1)));
	}

	$alternativa_marcada = JSON.parse(localStorage['gabarito'])[$questao_corrente - 1];
	$gabarito = JSON.parse(localStorage['gabarito']);
	$alternativa_marcada = $gabarito[$questao_corrente - 1];

	if ($alternativa_marcada != -1)
		$('#alternativas > button').eq($alternativa_marcada - 1).prop('class', 'list-group-item active');
	
	$('#navegacao').empty();

	if ($questao_corrente > 1) {
		$questao_anterior = parseInt($questao_corrente) - 1;
		$('#navegacao').append(
			"<button type='button' class='btn btn-default' id='" + $questao_anterior + "' aria-label='Anterior' style='width:30%;height:70px;float:left'>" +
			"<span class='glyphicon glyphicon-arrow-left' aria-hidden='true'></span>" +
			"</button>"
		);
	}

	if ($questao_corrente < data['total_questoes']) {
		$questao_proxima = parseInt($questao_corrente) + 1;
		$('#navegacao').append(
			"<button type='button' class='btn btn-info .avancar' id='" + $questao_proxima + "' aria-label='Próxima pergunta' style='width:60%;height:70px;float:right'>" +
			"<span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span>" +
			"</button>"
		);
	} else {
		$('#navegacao').append(
			"<button type='button' class='btn btn-success .avancar' id='submeter' aria-label='Próxima pergunta' style='width:60%;height:70px;float:right'>" +
			"<span class='glyphicon glyphicon-ok' aria-hidden='true'></span>" +
			"</button>"
		);
	}

	$('#alternativas > button').click(function() {
		if ($alternativa_marcada != -1) {
			$('#alternativa-' + $alternativa_marcada).prop('class', 'list-group-item');
		}

		$alternativa_marcada = $(this).val();
		$alternativa_marcada = $(this).val();
		$(this).prop('class', 'list-group-item active');

		if (localStorage.getItem('gabarito') !== null) {
			$gabaritoStr = localStorage.getItem('gabarito');
			$gabarito = JSON.parse(localStorage.getItem('gabarito'));
			$gabarito[$questao_corrente-1] = $alternativa_marcada;
			$gabaritoStr = JSON.stringify($gabarito);
			localStorage.setItem('gabarito', $gabaritoStr);
		}			
	})

	$(function() {
		$('#navegacao > button').click(function() {
			if ($(this).attr('id') != 'submeter') {
				$("#principal_conteudo").hide();
				$("#div_carregando").show();

				$questao_corrente = $(this).attr('id');
				$carregar_questao($questao_corrente);
			}
			else
			{
				if ($.checarRespostas(localStorage.getItem('gabarito')))
				{
					FB.getLoginStatus(function(response) {
						if (response.status == 'connected') {
							localStorage.setItem('accessToken', response.authResponse.accessToken);
							localStorage.setItem('userID', response.authResponse.userID);
							$submeter(localStorage);
						} else if (response.status !== 'not_authorized') {
							$.exibirTelaLogin();
						}
					}, true);

				}
				else
				{
					alert('Você não respondeu a todas as perguntas!');
				}
			}

		})
	});

};

$(document).ready(function() {
	$.ajaxSetup({
		cache: true
	});

	$.getScript('http://connect.facebook.net/en_US/sdk.js', function() {
		FB.init({
			appId: '375583466213621',
			version: 'v2.11'
		});

		// https://developers.facebook.com/docs/
		// reference/javascript/FB.getLoginStatus/
		FB.getLoginStatus(function(response) {
			if (response.status == 'connected') {
				localStorage.setItem('accessToken', response.authResponse.accessToken);
				localStorage.setItem('userID', response.authResponse.userID);

				$.consultarFacebook(response.authResponse.userID,response.authResponse.accessToken);

				//alert(response.authResponse.accessToken);
				$.exibirPaineis(['#div_carregando']);
				$carregar_questao('1');
				$.exibirPaineis(['#principal_conteudo']);				

			} else if (response.status !== 'not_authorized') {
				$.exibirTelaLogin();
			}
		}, true);

		FB.Event.subscribe('auth.login', function(response) {
			$.novaSessao();
		});

	});

});