Pipes:
	angularCodeExample/app/contacts/sort/sortContacts.pipe.ts

Dependency Injection:
	angularCodeExample/app/app.module.ts
	angularCodeExample/app/mediaLibrary/LadiesMediaLibraryService.ts
	
Decorators:
		angularCodeExample/app/confirmables
	
Mobile:
	angularCodeExample/app/mobmenu
	
CSCC:
	angularCodeExample/app/conversation/baseContact.scss
	
	
Приложение обращается к 3м endpoint-ам:
 - бэкэнд сайта
 - бэкэнд API на стороне NodeJS сервера
 - сокетм
Такая архитектура досталась мне по наследству.
 
Конфигурирование приложения для запуска с разными настройками для отладки:
Можно запустить с удаленным бэкэндом, локальным бэкэндом, мок бэкэндом, удаленным сокетом, локальным сокетм, мок сокетом
	angularCodeExample/environments
	angularCodeExample/angular.json
	
Запуск локально с разными настроками я сделал так
ng serve --configuration=remotesocketdebugbackend
ng serve --configuration=localsocketdebugbackend
итд

Сборка того же
ng build --configuration=production --base-href https://... --deploy-url https://...
итд