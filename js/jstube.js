// Parámetros del request a la API de YouTube
const query = {
    baseUrl: 'https://www.googleapis.com/youtube/v3/search?',
    part: 'snippet',
    type: {videos: 'video', canales: 'channel'},
    order: {visualizaciones: 'viewCount', relevancia: 'relevance'},
    busqueda: '',
    maxResults: {videos: 20, canales: 34},
    key: "AIzaSyBY_PO2x9Xph003A5nXa0GyQcRyPqvNq4o",
    // prevPageToken: '',
    // nextPageToken: ''
};

//Desestructurar para extraer valores
var { baseUrl, part, type, order, maxResults, key } = query;

// Configuración de la App
const config = {
    desarrollo: false,
    canales : {
        url: () => {
            return `${baseUrl}part=${part}&type=${type.canales}
            &order=${order.relevancia}&q=JavaScript+${query.busqueda}
            &maxResults=${maxResults.canales}&key=${key}&fields=items(snippet(channelId,channelTitle,thumbnails))`;
        },
        css: "canal",
        dom: document.querySelector(".canales"),
    },
    videos : {
        url: () => { 
            return `${baseUrl}part=${part}&type=${type.videos}
            &order=${order.relevancia}&q=JavaScript+${query.busqueda}
            &maxResults=${maxResults.videos}&key=${key}&fields=items(id, snippet(channelTitle,title,thumbnails))`;
        },
        css: "video",
        dom: document.querySelector(".videos"),
    },
};

//Funcionalidad de búsqueda de canales y videos
document.querySelector('form').onsubmit = evento => {
    evento.preventDefault();
    buscar(document.querySelector('.cabecera__formulario__busqueda').value);
}
function buscar(busqueda) {
    query.busqueda = busqueda;
    borrarElementos();
    JSTube();
}

function borrarElementos() {
    var videos = document.querySelectorAll('.video');
    videos.length && videos.forEach(video => video.remove());

    var canales = document.querySelectorAll('.canal');
    canales.length && canales.forEach(canal => canal.remove());


}

//Solicitar info al API de Youtube (tipo:canal o video)
function solicitarYT(tipo) {
    return fetch(config.desarrollo ? `json/${tipo}.json` : config[tipo].url())
        .then(respuesta => {
            return respuesta.json()
                .then(json => {
                    
                     return {json,tipo};
                })
        })
        .catch(error => console.error(error));
}


//Crear y añador al DOM canales y/o videos
function crearElemento(elementos, tipo) {
    elementos.forEach(elemento => {
        //Elemento img
        let fuenteImagen = elemento.snippet.thumbnails.medium.url,
            imagen = document.createElement('img');
        
        imagen.src = fuenteImagen;
        imagen.classList.add(`${config[tipo].css}__imagen`);

        //Enlace

        let enlace = document.createElement('a');
        enlace.classList.add(`${config[tipo].css}__enlace`);

        if (tipo === 'videos') {
            enlace.title = elemento.snippet.title;
            enlace.href = `https:/www.youtube.com/watch?v=${elemento.id.videoId}`;
        } else if (tipo === 'canales') {
            enlace.title = elemento.snippet.channelTitle;
            enlace.href = `https://www.youtube.com/channel/${elemento.snippet.channelId}`;

        }

        enlace.target = '_blank';
        enlace.appendChild(imagen)

        //Añadirlo a un div

        let item = document.createElement('div');
        item.classList.add(config[tipo].css);
        item.appendChild(enlace);

        //Añadirlo a su elemento contenedor
        config[tipo].dom.appendChild(item);
    });;
}

//Pieza pública que enñaza y comienza todo

export default function JSTube() {
    Promise.all([solicitarYT('videos'), solicitarYT('canales')])
        .then(respuestas => {
            respuestas.forEach(respuesta => {
                crearElemento(respuesta.json.item, respuesta.tipo);
            })
        })
        .catch(error => console.error(error));


}