///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2017 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    /**
        General-purpose texture.

        @class
        @prop {WebGLRenderingContext} gl The WebGL context.
        @prop {WebGLTexture} texture Handle to the texture.
        @prop {GLEnum} internalFormat Internal arrangement of the texture data.
        @prop {GLEnum} type Type of data stored in the texture.
    */
    PicoGL.Texture = function Texture(gl, binding, image, options) {
        options = options || PicoGL.DUMMY_OBJECT;

        this.gl = gl;
        this.binding = binding;
        this.is3D = this.binding === gl.TEXTURE_3D || this.binding === gl.TEXTURE_2D_ARRAY;
        this.texture = gl.createTexture();
        this.format = options.format || gl.RGBA;
        this.internalFormat = options.internalFormat || gl.RGBA;
        this.type = options.type || gl.UNSIGNED_BYTE;

        var buffer = options.buffer || false;
        var width = options.width || 0;
        var height = options.height || 0;
        var depth = options.depth || 0;
        var flipY = options.flipY !== undefined ? options.flipY : true;
        var minFilter = options.minFilter || gl.LINEAR_MIPMAP_NEAREST;
        var magFilter = options.magFilter || gl.LINEAR;
        var wrapS = options.wrapS || gl.REPEAT;
        var wrapT = options.wrapT || gl.REPEAT;
        var wrapR = options.wrapR || gl.REPEAT;
        var generateMipmaps = options.generateMipmaps !== false && 
                            (minFilter === gl.LINEAR_MIPMAP_NEAREST || minFilter === gl.LINEAR_MIPMAP_LINEAR);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(this.binding, this.texture);
        
        gl.texParameteri(this.binding, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(this.binding, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(this.binding, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(this.binding, gl.TEXTURE_WRAP_T, wrapT);

        if (this.is3D) {
            gl.texParameteri(this.binding, gl.TEXTURE_WRAP_R, wrapR);
            gl.texImage3D(this.binding, 0, this.internalFormat, width, height, depth, 0, this.format, this.type, image);
        } else {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
            if (buffer) {
                gl.texImage2D(this.binding, 0, this.internalFormat, width, height, 0, this.format, this.type, image);
            } else {
                gl.texImage2D(this.binding, 0, this.internalFormat, this.format, this.type, image);
            }
        }

        if (generateMipmaps) {
            gl.generateMipmap(this.binding);
        }

        gl.bindTexture(this.binding, null);

    };

    /**
        Set the image data for the texture. Width and height should only
        be passed for ArrayBufferView data.
    
        @method
        @param {ImageElement|ArrayBufferView} image Image data.
        @param {number} [width] Image width (should only be passed for ArrayBufferView data).
        @param {number} [height] Image height (should only be passed for ArrayBufferView data).
    */
    PicoGL.Texture.prototype.image = function(image, width, height, depth) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.binding, this.texture);

        if (this.is3D) {
            this.gl.texImage3D(this.binding, 0, this.internalFormat, width, height, depth, 0, this.format, this.type, image);
        } else {
            if (width && height) {
                this.gl.texImage2D(this.binding, 0, this.internalFormat, width, height, 0, this.format, this.type, image);
            } else {
                this.gl.texImage2D(this.binding, 0, this.internalFormat, this.format, this.type, image);
            }
        }

        this.gl.bindTexture(this.binding, null);

        return this;
    };  

    /**
        Bind this texture to a texture unit.

        @method
        @param {number} unit The texture unit to bind to.
    */
    PicoGL.Texture.prototype.bind = function(unit) {
        this.gl.activeTexture(unit);
        this.gl.bindTexture(this.binding, this.texture);

        return this;
    };   

})();
