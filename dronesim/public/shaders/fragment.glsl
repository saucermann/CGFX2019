#version 300 es
#define MAX_POINT_LIGHTS 4

// This fragment shader works with a finite number of point lights,
// a single direct light and an ambient light color.

precision highp float;

struct PointLight {
    vec3 position;
	float decay;
	vec4 color;
	float target;
};

struct DirectLight {
	vec3 direction;
	vec4 color;
};

struct Material {
	vec4 diffuse;
	vec4 ambient;
	vec4 specular;
	vec4 emit;
	float shine;
};

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D 	u_texture;
uniform vec3 		u_eye_pos;
uniform bool 		u_has_texture;
uniform float 		u_tex_factor;
uniform Material	u_mat;

// Lights and params
uniform vec4 		u_amb_light;
uniform DirectLight u_dir_light;
uniform PointLight 	u_point_lights[MAX_POINT_LIGHTS];
uniform int 		u_pl_length;

// Normalized normals and eye direction
vec3 normal;
vec3 eye_dir;

// Material colors recalculated using textures
vec4 diffuse_color;
vec4 ambient_color;
vec4 emit_color;

out vec4 color;

float lambert_diffuse(vec3 light_direction) {
	return clamp(dot(normal, light_direction),0.0,1.0);
}

float blinn_specular(vec3 light_direction) {
	vec3 half_vector = normalize(light_direction + eye_dir);
	return pow(clamp(dot(normal, half_vector), 0.0, 1.0), u_mat.shine);
}

vec4 calc_point_light(PointLight light) {
	vec3 direction = normalize(light.position-fs_pos);
	float attenuation = pow(light.target/length(light.position-fs_pos), light.decay);
	vec4 diffuse = lambert_diffuse(direction)*diffuse_color;
	vec4 specular = blinn_specular(direction)*u_mat.specular;
	return light.color*attenuation*(diffuse + specular);
}

vec4 calc_directional_light() {
	vec4 diffuse = lambert_diffuse(u_dir_light.direction)*diffuse_color;
	vec4 specular = blinn_specular(u_dir_light.direction)*u_mat.specular;
	vec4 color = u_dir_light.color*(specular + diffuse);
	return clamp(color, 0.0, 1.0);
}

void main() {
	normal = fs_norm;
	eye_dir = normalize(u_eye_pos - fs_pos);

	// If the object has texture rendering on, then overwrite values for diffuse, ambient and
	// emit, and consider a certain "percentage" of texture color.
	if(u_has_texture) {
		vec4 tex_color = texture(u_texture, fs_uv);
		diffuse_color = u_mat.diffuse * (1.0-u_tex_factor) + tex_color * u_tex_factor;
		ambient_color = u_mat.ambient * (1.0-u_tex_factor) + clamp(u_mat.ambient * tex_color, 0.0, 1.0) * u_tex_factor;
		emit_color = u_mat.emit * (1.0-u_tex_factor) +
					tex_color * u_tex_factor * max(max(u_mat.emit.r, u_mat.emit.g),
					u_mat.emit.b);
	} else {
		diffuse_color = u_mat.diffuse;
		ambient_color = u_mat.ambient;
		emit_color = u_mat.emit;
	}

	// Evaluate ambient light contribution.
	vec4 ambient = ambient_color * u_amb_light;

	// Evaluate directional light impact
	vec4 dir_light_contrib = calc_directional_light();

	// Evaluate point lights contribution
	vec4 point_lights_contrib = vec4(0.0, 0.0, 0.0, 0.0);

	for (int i = 0; i < u_pl_length; i++) {
		point_lights_contrib += calc_point_light(u_point_lights[i]);
	}

	color = clamp(dir_light_contrib + point_lights_contrib + ambient + emit_color, 0.0, 1.0);
}
