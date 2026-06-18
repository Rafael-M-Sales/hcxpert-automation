Feature: API Trello - Consultar Ação
  Como consumidor da API do Trello
  Quero consultar uma ação específica
  Para validar o conteúdo do campo "name" da estrutura "list"

  @positive
  Scenario: GET na API do Trello retorna status 200 e campo list.name
    When envio uma requisição GET para "https://api.trello.com/1/actions/592f11060f95a3d3d46a987a"
    Then o status code da resposta deve ser 200
    And o campo "name" da estrutura "list" deve conter "Professional"

  @negative
  Scenario: GET na API do Trello com ID inválido retorna erro
    When envio uma requisição GET para "https://api.trello.com/1/actions/id_invalido"
    Then o status code da resposta deve ser 400
