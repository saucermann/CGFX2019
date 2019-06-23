#version 300 es
#define NR_POINT_LIGHTS 4  

precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D 	u_texture;

uniform vec3 		eye_pos;

uniform vec3 		light_direction;
uniform vec4 		light_color;
uniform vec4 		ambient_light_color;

uniform bool 		has_texture;
uniform vec4 		specular_color;
uniform vec4 		diffuse_color;
uniform vec4 		emit_color;
uniform vec4 		ambient_color;
uniform float 		specular_shine;
uniform float 		tex_factor;

out vec4 color;


float lambert_diffuse(vec3 normal_vector, vec3 light_direction) {
	return clamp(dot(normalize(fs_norm), light_direction),0.0,1.0);
}

float blinn_specular(vec3 normal_vector, vec3 light_direction, vec3 eye_direction) {
	vec3 half_vector = normalize(light_direction + eye_direction);
	float blinn_specular = pow(clamp(dot(normal_vector, half_vector), 0.0, 1.0), specular_shine);
	return blinn_specular;
}

void main() {
	vec3 normal_vector = normalize(fs_norm);
	vec3 eye_direction = normalize(eye_pos - fs_pos);
	vec4 diff_color;
	vec4 amb_color;
	vec4 emit;
	if(has_texture) {
		vec4 tex_color = texture(u_texture, fs_uv);
		diff_color = diffuse_color * (1.0-tex_factor) + tex_color * tex_factor;
		amb_color = ambient_color * (1.0-tex_factor) + tex_color * tex_factor;
		emit = emit_color * (1.0-tex_factor) +
					tex_color * tex_factor * max(max(emit_color.r, emit_color.g), emit_color.b);
	} else {
		diff_color = diffuse_color;
		amb_color = ambient_color;
		emit = emit_color;
	}

	vec4 diffuse = lambert_diffuse(normal_vector, light_direction)*light_color*diff_color;
	vec4 ambient = ambient_color * ambient_light_color;
	vec4 specular = blinn_specular(normal_vector, light_direction, eye_direction)*light_color*specular_color;

	color = clamp(ambient + diffuse + specular + emit, 0.0, 1.0);
}