#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec4 lightDir;
uniform float ambFact;

out vec4 color;

void main() {
	vec4 texcol;
	float dimFact = (1.0-ambFact) * clamp(dot(normalize(fs_norm), lightDir.xyz),0.0,1.0) + ambFact;
	texcol = texture(u_texture, fs_uv);
	color = vec4(texcol.rgb * dimFact, texcol.a);
}
