
# Chat App
This project is a simple chat application built with NestJS, using RabbitMQ for message queuing, and Docker for containerization. Terraform is used to manage the infrastructure.

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
-  [Node.js](https://nodejs.org/) (v18 or later)
-  [Docker](https://www.docker.com/)
-  [Terraform](https://www.terraform.io/)
-  [Yarn](https://yarnpkg.com/)

## Setup
### Clone the Repository
```sh
git  clone  https://github.com/4cc3ssX/take-home-backend
cd  take-home-backend
```
### Install Dependencies
```sh
yarn install
```

## Running the Application
### Using Docker CLI
To build and run the Docker containers:
1. Build the Docker Image
	```sh
	docker build -t ryam47/chat-app:0.0.1 .
 	```
2. Run the Docker Containers
	```sh
	docker run -d --name rabbitmq -p 5672:5672 rabbitmq:latest
	docker run -d --name chat-app --link rabbitmq -e RABBITMQ_URL=amqp://rabbitmq:5672 -e PORT=3000 -p 3000:3000 ryam47/chat-app:0.0.1
	```
### Using Docker Compose
Alternatively, you can use Docker Compose to manage the containers:
1. Run Docker Compose
	```sh
	docker-compose up -d
	```
### Using Terraform
You can also manage the Docker setup using Terraform:
1. Initialize Terraform
	```sh
	terraform init
	```
2. Apply the Terraform Configuration
	```sh
	terraform apply
	```
#### Testing
To run tests, you can use the following command:
```sh
yarn test
```
