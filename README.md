# ASSO 2019
# Tema: 
Live Coding of the Pipes and Filters Architecture (and possibly towards Event-Driven)



# Composição do Grupo:
* João Pedro Furriel
* José Pedro Machado
* Pedro Silva


## Abordagem

  Com este trabalho, pretendemos seguir o 4º cenário descrito em [https://github.com/hugoferreira/asso-pipes-and-stuff-v19] de forma a permitir ter vários Publishers
e vários Subscribers. Um dos grandes objetivos a que nos propusemos foi a idealizar uma infrastrutura não local, mas em rede e descentralizada, na qual cada host funciona simultaneamente como Publisher e Subscriber, e na qual o Broker apenas direciona as mensagens para o local correto.


A nível de funcionalidades, focamo-nos em 4 módulos principais: Conversion, Arithmetic/Logic, Text e Hashing/Encryption. Inicialmente, é apresentado uma lista com todos os módulos.


![alt text](https://imgur.com/pQP9mKE.png)

Após isso, basta escolher um módulo pretendido, e este irá aparecer numa nova janela, disponiblizando as funcionalidades do próprio módulo.

![alt text](https://imgur.com/qejFqQa.png)


Cada host pode ter disponível funcionalidades de outros tipos de módulo que não o seu. Necessita apenas da existência de outra janela com o módulo diferente do atual, e necessita que nesta janela se dê "check" à funcionalidade que se pretende disponiblizar para os restantes hosts.

![alt text](https://imgur.com/q13V5Ah.gif)


Desta forma, temos um sistema em que cada módulo, quando iniciado, avisa o Broker que está disponível, podendo de forma dinâmica e através do "check" e "uncheck" de cada funcionalidade, disponiblizar e retirar funcionalidade entre todos os hosts. 

Após isso, basta apenas construir o grafo com os Inputs e funcionalidades pretendidas, acabar tudo o grafo num nó de Output, e depois primir o botão Enter, de forma a ativar um algoritmo que irá percorrer o grafo e dára a resposta no nó de Output. 

![alt text](https://imgur.com/TxaPF9e.gif)



# Design Patterns mais usados:

* **Publisher-Subscriber:** Pattern usado como a estrura base de todo o projeto, ao ter cada host como sendo simultaneamente como Publisher e Subscriber. O Publisher-Subscriber foi adaptado ao modelo Request/response nos casos em que era ncessário mapear um pedido com uma resposta.

* **Pipes and Filters:** Pattern usado de forma a construir cada grafo como um pipe na qual cada nó (filter) contém as funcionalidades que estarão presentes nesta cadeia de elementos a serem processados.

* **Interpreter e Composite:** Composite usado para compor os objetos numa estrutura do tipo árvore, bastante útil tendo em conta a configuração em árvore dos serviços selecionados desde os inputs (folhas), passando pelos serviços (nós) até ao output (raíz), bem como uso de Interpreter para percorrer a mesma. (Classe GraphInterpreter)

* **Observer:** Usado para a classe interface de comunicação com o Broker (subject) notificar as classes que estão a observar e necessitam de saber da chegada de mensagens (observers). (Classe BrokerInterface, Interfaces Observer e Subject).

* **Plugin:** Pattern usado nas checkboxes, com o intuito de adicionar e remover de forma dinâmica apenas as funcionalidades que cada módulo disponibiliza aos restantes.

* **Adaptação Publisher/Subscriber a Request/Response:** Adaptação do modelo Publisher/Subscriber ao Request/Response apenas para os casos em que um nó necessita de fazer o tracking entre um pedido a outro nó e correspondente resposta. Desenvolvimento de uma classe (também observer do BrokerInterface) chamada MQTTRequestService responsável por enviar o pedido e esperar pela resposta fazendo o mapeamento entre as duas coisas e usando callbacks para os vários eventos. Em cima desta foi desenvolvida uma função para abstrair as callbacks com Promise. Os elementos MQTTRequestService e fetchMQTT faz o paralelo com XMLHttpRequest e fetch de api HTTP. 
