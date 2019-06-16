# ASSO 2019
# Tema: 
Live Coding of the Pipes and Filters Architecture (and possibly towards Event-Driven)



# Composição do Grupo:
* João Pedro Furriel
* José Pedro Machado
* Pedro Silva


## Abordagem

  Com este trabalho, pretendemos seguir o 4º cenário descrito em [https://github.com/hugoferreira/asso-pipes-and-stuff-v19] de forma a permitir ter vários Publishers
e vários Subscribers. Um dos grandes objetivos a que nos propusemos foi a idealizar uma infrastrutura não local, mas em rede, na qual cada host funciona simultaneamente como Publisher e Subscriber, e na qual o Broker apenas direciona as mensagens para o local correto.


A nível de funcionalidades, focamo-nos em 4 módulos principais: Conversion, Arithmetic/Logic, Text e Hashing/Encryption. Inicialmente, é apresentado uma lista com todos os módulos.


![alt text](https://imgur.com/pQP9mKE.png)

Após isso, basta escolher um módulo pretendido, e este irá aparecer numa nova janela, disponiblizando as funcionalidades do próprio módulo.

![alt text](https://imgur.com/qejFqQa.png)


Cada host pode ter disponível funcionalidades de outros tipos de módulo que não o seu. Necessita apenas da existência de outra janela com o módulo diferente do atual, e necessita que nesta janela se dê "check" à funcionalidade que se pretende disponiblizar para os restantes hosts.

![alt text](https://imgur.com/q13V5Ah.gif)


Desta forma, temos um sistema em que cada módulo, quando iniciado, avisa o Broker que está disponível, podendo de forma dinâmica e através do "check" e "uncheck" de cada funcionalidade, disponiblizar e retirar funcionalidade entre todos os hosts. 

Após isso, basta apenas construir o grafo com os Inputs e funcionalidades pretendidas, acabar tudo o grafo num nó de Output, e depois primir o botão Enter, de forma a ativar um algoritmo que irá percorrer o grafo e dára a resposta no nó de Output. 

![alt text](https://imgur.com/TxaPF9e.gif)
